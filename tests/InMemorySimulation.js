import Immutable from 'immutable'
import sinon from 'sinon'
import { range, sample, random, isArray } from 'lodash'
import EventEmitter from 'eventemitter3'

import { eventsStreamFromBus } from '../src/utils'

const AGGREGATES_NUM = 200
const AGGREGATE_TYPES = Immutable.fromJS(range(3, 30).map(n => `Type${n}`))
const EVENT_TYPES = Immutable.fromJS(range(20, 40).map(n => `Type${n}`))
const MIN_EVENTS_PER_AGGREGATE = 1
const MAX_EVENTS_PER_AGGREGATE = 20
const SNAPSHOT_THRESHOLD = 7

function InMemorySimulation (data) {
  let {aggregates, events, snapshots} = data
  let store = FixtureStore()
  let backend = FixtureBackend({aggregates, events, snapshots, store})

  return {
    aggregates,
    events,
    snapshots,
    backend: Object.keys(backend)
              .reduce((spied, handler) => {
                spied[handler] = sinon.spy(backend[handler])
                return spied
              }, {}),
    store,
    call: FixtureGRPCCall(),
    callback: sinon.spy()
  }
}

function FixtureBackend ({aggregates, events, snapshots, store}) {
  function dispatchEvents (results, events) {
    events.forEach((evt, idx) => process.nextTick(() => {
      results.emit('event', evt.toJS())
    }))
    setTimeout(function () {
      results.emit('end')
    }, events.size)
  }
  function dispatchSnapshot (results, snapshot) {
    process.nextTick(() => {
      results.emit('snapshot', snapshot.toJS())
    })
    setTimeout(function () {
      results.emit('end')
    }, 5)
  }

  return {
    getEvents ({fromEventId, limit}) {
      let results = new EventEmitter()
      let filteredEvents = events.filter(evt => evt.get('id') > fromEventId)
      filteredEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents

      dispatchEvents(results, filteredEvents)

      return results
    },
    getEventsByAggregate ({aggregateIdentity, fromVersion, limit}) {
      let results = new EventEmitter()
      let { id, type } = aggregateIdentity
      let filteredEvents = events.filter(evt =>
        evt.get('sequenceNumber') > fromVersion &&
        evt.get('aggregateId') === id &&
        evt.get('aggregateType') === type
      )
      filteredEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents

      dispatchEvents(results, filteredEvents)

      return results
    },
    getEventsByAggregateTypes ({aggregateTypes, fromEventId, limit}) {
      let results = new EventEmitter()
      let filteredEvents = events.filter(evt =>
        evt.get('id') > fromEventId &&
        ~aggregateTypes.indexOf(evt.get('aggregateType'))
      )
      filteredEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents

      dispatchEvents(results, filteredEvents)

      return results
    },
    getEventsByTypes ({eventTypes, fromEventId, limit}) {
      let results = new EventEmitter()
      let filteredEvents = events.filter(evt =>
        evt.get('id') > fromEventId &&
        ~eventTypes.indexOf(evt.get('type'))
      )
      filteredEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents

      dispatchEvents(results, filteredEvents)

      return results
    },
    getLastSnapshotOfAggregate ({aggregateIdentity}) {
      let results = new EventEmitter()
      let { id, type } = aggregateIdentity
      let snapshot = snapshots.filter(snapshot =>
        snapshot.get('aggregateId') === id &&
        snapshot.get('aggregateType') === type
      ).takeLast(1).get(0)

      dispatchSnapshot(results, snapshot)

      return results
    },
    storeEvents () {}
  }
}

function FixtureStore () {
  let messageBus = new EventEmitter()
  return {
    eventsStream: eventsStreamFromBus(messageBus),
    publishEvents: sinon.spy((events) => {
      events = isArray(events) ? events : [events]
      events.forEach((evt, idx) => setTimeout(() => {
        messageBus.emit('StoredEvents', JSON.stringify([evt]))
      }, idx * 5))
    })
  }
}

function FixtureGRPCCall () {
  let call = new EventEmitter()
  sinon.spy(call, 'on')
  sinon.spy(call, 'emit')
  sinon.spy(call, 'removeAllListeners')
  call.write = sinon.spy()
  call.end = sinon.spy()

  return call
}

function getSimulationData () {
  let aggregateTypes = AGGREGATE_TYPES.toArray()
  let eventTypes = EVENT_TYPES.toArray()
  let now = Date.now()
  let firstTime = now - (180 * 1000) // 3 min
  let aggregates = Immutable.fromJS(range(AGGREGATES_NUM).map(n => ({
    id: `aid${n}`,
    type: sample(aggregateTypes),
    version: random(MIN_EVENTS_PER_AGGREGATE, MAX_EVENTS_PER_AGGREGATE) // First version of aggregate should be 1
  })))
  let aggregateStreams = Immutable.fromJS(aggregates.map(
    (aggregate) => {
      return Immutable.fromJS(range(aggregate.get('version')).map(n => ({
        type: sample(eventTypes),
        aggregateId: aggregate.get('id'),
        aggregateType: aggregate.get('type'),
        sequenceNumber: n + 1, // First event of an aggregate should be 1
        data: '',
        metadata: ''
      })))
    }
  ))

  let events = Immutable.fromJS(
    range(aggregateStreams.flatten(true).size)
      .map(() => {
        let streamIdx = random(aggregateStreams.size - 1)
        let stream = aggregateStreams.get(streamIdx)
        let evt = stream.get(0)
        aggregateStreams = aggregateStreams.set(streamIdx, stream.shift())
        if (!aggregateStreams.get(streamIdx).size) {
          aggregateStreams = aggregateStreams.delete(streamIdx)
        }
        return evt
      })
  )

  let instants = events
                  .map(() => random(firstTime, now))
                  .sortBy(ms => ms)
                  .map(ms => new Date(ms))
                  .map(d => d.toISOString())

  events = events.map(
    (evt, idx) => evt.set('id', idx + 1).set('storedOn', instants.get(idx))
  )

  let snapshots = aggregates
                    .filter(aggregate => aggregate.get('version') > SNAPSHOT_THRESHOLD)
                    .map(aggregate => {
                      let snapshotsN = Math.floor(aggregate.get('version') / SNAPSHOT_THRESHOLD)
                      return Immutable.fromJS(range(snapshotsN).map(n => ({
                        aggregateId: aggregate.get('id'),
                        aggregateType: aggregate.get('type'),
                        version: (n + 1) * SNAPSHOT_THRESHOLD,
                        data: ''
                      })))
                    }).flatten(true)

  return {
    aggregates,
    events,
    snapshots
  }
}

export default InMemorySimulation
export {
  getSimulationData,
  AGGREGATES_NUM,
  AGGREGATE_TYPES,
  EVENT_TYPES,
  MIN_EVENTS_PER_AGGREGATE,
  MAX_EVENTS_PER_AGGREGATE,
  SNAPSHOT_THRESHOLD
}
