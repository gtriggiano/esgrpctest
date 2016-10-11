import pg from 'pg'
import { random, pick, uniq, min } from 'lodash'
import should from 'should/as-function'
import sinon from 'sinon'
import Immutable from 'immutable'
import EventEmitter from 'eventemitter3'

// Load test data in memory
let data = require('./testData.json')
global.testData = {
  aggregates: Immutable.fromJS(data.aggregates),
  events: Immutable.fromJS(data.events),
  snapshots: Immutable.fromJS(data.snapshots)
}

import CockroachBackend from '../src/BackendInterface/backends/cockroachdb'

let cockroachCoordinates = {
  host: process.env.COCKROACH_HOST || 'cockroach',
  port: process.env.COCKROACH_PORT ? parseInt(process.env.COCKROACH_PORT, 10) : 26257,
  user: process.env.COCKROACH_USER || 'root'
}
let backend = CockroachBackend(cockroachCoordinates)

describe('CockroachBackend(settings)', () => {
  it(`is a function`, () => should(CockroachBackend).be.a.Function())
  it('throws if settings.host is not a valid string', () => {
    function throwing () {
      CockroachBackend({
        host: ''
      })
    }
    function throwing2 () {
      CockroachBackend({
        host: 2
      })
    }
    should(throwing).throw()
    should(throwing2).throw()
  })
  it('throws if settings.port is not a positive integer', () => {
    function throwing () {
      CockroachBackend({
        port: ''
      })
    }
    function throwing2 () {
      CockroachBackend({
        port: -2
      })
    }
    should(throwing).throw()
    should(throwing2).throw()
  })
  it('throws if settings.database is not a valid string', () => {
    function throwing () {
      CockroachBackend({
        database: ''
      })
    }
    function throwing2 () {
      CockroachBackend({
        database: 2
      })
    }
    should(throwing).throw()
    should(throwing2).throw()
  })
  it('throws if settings.user is not a valid string', () => {
    function throwing () {
      CockroachBackend({
        user: ''
      })
    }
    function throwing2 () {
      CockroachBackend({
        user: 2
      })
    }
    should(throwing).throw()
    should(throwing2).throw()
  })
})

describe('Cockroach Backend instance', () => {
  it('should have method .setup()', () => {
    should(backend.setup).be.a.Function()
  })
  it('should have method .getEvents()', () => {
    should(backend.getEvents).be.a.Function()
  })
  it('should have method .getEventsByAggregate()', () => {
    should(backend.getEventsByAggregate).be.a.Function()
  })
  it('should have method .getEventsByAggregateTypes()', () => {
    should(backend.getEventsByAggregateTypes).be.a.Function()
  })
  it('should have method .getEventsByTypes()', () => {
    should(backend.getEventsByTypes).be.a.Function()
  })
  it('should have method .getLastSnapshotOfAggregate()', () => {
    should(backend.getLastSnapshotOfAggregate).be.a.Function()
  })
  it('should have method .storeEvents()', () => {
    should(backend.storeEvents).be.a.Function()
  })
})

describe('backend.setup(callback(err))', () => {
  before(() => flushDB())

  it('should ensure the aggregates, events and snapshots tables and call callback', (done) => {
    backend.setup((err) => {
      if (err) return done(err)
      getClient().then(client => {
        client.query(
          `SHOW TABLES FROM eventstore`,
          (err, result) => {
            if (err) done(err)
            should(result.rows.map(({Table}) => Table)).containDeep([
              'aggregates',
              'events',
              'snapshots'
            ])
            client.end()
            done()
          }
        )
      })
    })
  })
})
describe('backend.getEvents({fromEventId[, limit]})', () => {
  before(() => populateDB())

  it('should return an Event Emitter', () => {
    let results = backend.getEvents({fromEventId: 0, limit: 1})
    should(results).be.an.instanceof(EventEmitter)
  })
  it('returned EE should emit `event` for each event fetched', (done) => {
    let storedEvents = testData.events.slice(-10)
    let results = backend.getEvents({
      fromEventId: storedEvents.get(0).get('id') - 1
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(10)
      done()
    })
  })
  it('returned EE should emit `end` event when all fetched events have been emitted', (done) => {
    let storedEvents = testData.events.slice(-10)
    let results = backend.getEvents({
      fromEventId: storedEvents.get(0).get('id') - 1
    })
    let c = 0
    results.on('event', () => {
      c++
    })
    results.on('end', () => {
      should(c).equal(10)
      done()
    })
  })
  it('returned EE should emit just `end` if no events are found', (done) => {
    let results = backend.getEvents({
      fromEventId: 1000000
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(0)
      done()
    })
  })
  it('returned EE should emit the events ordered by `id`', function (done) {
    this.timeout(4000)
    let results = backend.getEvents({
      fromEventId: 0
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(testData.events.size)
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(testData.events.toJS().map(({id}) => id))
      done()
    })
  })
  it('fetching should get all events with `id` > `fromEventId`', function (done) {
    this.timeout(4000)
    let storedEvents = testData.events.slice(random(-5, -testData.events.size))
    let results = backend.getEvents({
      fromEventId: storedEvents.get(0).get('id') - 1
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(storedEvents.size)
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(storedEvents.toJS().map(({id}) => id))
      done()
    })
  })
  it('fetching should take in to account `limit` param if provided', (done) => {
    let lastEvtsN = random(-100, -50)
    let storedEvents = testData.events.slice(lastEvtsN)
    let limit = random(1, storedEvents.size * 2)
    let results = backend.getEvents({
      fromEventId: storedEvents.get(0).get('id') - 1,
      limit
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(min([limit, storedEvents.size]))
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(storedEvents.slice(0, limit).toJS().map(({id}) => id))
      done()
    })
  })
})
describe('backend.getEventsByAggregate({aggregateIdentity, fromVersion[, limit]})', () => {
  let aggregatesWithManyVersions = testData.aggregates.filter(a => a.get('version') > 10)
  let testAggregate = aggregatesWithManyVersions.get(random(aggregatesWithManyVersions.size - 1))
  let testAggregateEvents = testData.events.filter(e =>
    e.get('aggregateId') === testAggregate.get('id') &&
    e.get('aggregateType') === testAggregate.get('type')
  )
  let testAggregateIdentity = pick(testAggregate.toJS(), ['id', 'type'])

  it('should return an Event Emitter', () => {
    let results = backend.getEventsByAggregate({
      aggregateIdentity: testAggregateIdentity,
      fromVersion: 0
    })
    should(results).be.an.instanceof(EventEmitter)
  })
  it('returned EE should emit `event` for each event fetched', (done) => {
    let results = backend.getEventsByAggregate({
      aggregateIdentity: testAggregateIdentity,
      fromVersion: 0
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(testAggregateEvents.size)
      done()
    })
  })
  it('returned EE should emit `end` event when all fetched events have been emitted', (done) => {
    let results = backend.getEventsByAggregate({
      aggregateIdentity: testAggregateIdentity,
      fromVersion: 0
    })
    let c = 0
    results.on('event', () => {
      c++
    })
    results.on('end', () => {
      should(c).equal(testAggregateEvents.size)
      done()
    })
  })
  it('returned EE should emit just `end` if no events are found', (done) => {
    let results = backend.getEventsByAggregate({
      aggregateIdentity: testAggregateIdentity,
      fromVersion: 1000
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(0)
      done()
    })
  })
  it('returned EE should emit the events ordered by `id`', (done) => {
    let results = backend.getEventsByAggregate({
      aggregateIdentity: testAggregateIdentity,
      fromVersion: 0
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(testAggregateEvents.toJS().map(({id}) => id))
      done()
    })
  })
  it('fetching should get all events with `sequenceNumber` > `fromVersion`', (done) => {
    let storedEvents = testAggregateEvents.filter(e => e.get('sequenceNumber') > 2)
    let results = backend.getEventsByAggregate({
      aggregateIdentity: testAggregateIdentity,
      fromVersion: 2
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(storedEvents.size)
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(storedEvents.toJS().map(({id}) => id))
      done()
    })
  })
  it('fetching should take in to account `limit` param if provided', (done) => {
    let storedEvents = testAggregateEvents.filter(e => e.get('sequenceNumber') > 2)
    let limit = random(1, storedEvents.size * 2)
    let results = backend.getEventsByAggregate({
      aggregateIdentity: testAggregateIdentity,
      fromVersion: 2,
      limit
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(min([limit, storedEvents.size]))
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(storedEvents.slice(0, limit).toJS().map(({id}) => id))
      done()
    })
  })
})
describe('backend.getEventsByAggregateTypes({aggregateTypes, fromEventId[, limit]})', () => {
  let testAggregates = testData.aggregates
    .sortBy(() => Math.random())
    .slice(0, 3)
  let testAggregatesTypes = uniq(testAggregates.map(a => a.get('type')).toJS())
  let testEvents = testData.events.filter(e => !!~testAggregatesTypes.indexOf(e.get('aggregateType')))

  it('should return an Event Emitter', () => {
    let results = backend.getEventsByAggregateTypes({
      aggregateTypes: testAggregatesTypes,
      fromEventId: 0,
      limit: 1
    })
    should(results).be.an.instanceof(EventEmitter)
  })
  it('returned EE should emit `event` for each event fetched', (done) => {
    let results = backend.getEventsByAggregateTypes({
      aggregateTypes: testAggregatesTypes,
      fromEventId: 0
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(testEvents.size)
      done()
    })
  })
  it('returned EE should emit `end` event when all fetched events have been emitted', (done) => {
    let results = backend.getEventsByAggregateTypes({
      aggregateTypes: testAggregatesTypes,
      fromEventId: 0
    })
    let c = 0
    results.on('event', () => {
      c++
    })
    results.on('end', () => {
      should(c).equal(testEvents.size)
      done()
    })
  })
  it('returned EE should emit just `end` if no events are found', (done) => {
    let results = backend.getEventsByAggregateTypes({
      aggregateTypes: testAggregatesTypes,
      fromEventId: 1000000
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(0)
      done()
    })
  })
  it('returned EE should emit the events ordered by `id`', (done) => {
    let results = backend.getEventsByAggregateTypes({
      aggregateTypes: testAggregatesTypes,
      fromEventId: 0
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(testEvents.toJS().map(({id}) => id))
      done()
    })
  })
  it('fetching should get all events with `id` > `fromEventId`', (done) => {
    let storedEvents = testEvents.slice(random(-5, -testEvents.size))
    let results = backend.getEventsByAggregateTypes({
      aggregateTypes: testAggregatesTypes,
      fromEventId: storedEvents.get(0).get('id') - 1
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(storedEvents.size)
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(storedEvents.toJS().map(({id}) => id))
      done()
    })
  })
  it('fetching should take in to account `limit` param if provided', (done) => {
    let storedEvents = testEvents.slice(random(-5, -testEvents.size))
    let limit = random(1, storedEvents.size * 2)
    let results = backend.getEventsByAggregateTypes({
      aggregateTypes: testAggregatesTypes,
      fromEventId: storedEvents.get(0).get('id') - 1,
      limit
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(min([limit, storedEvents.size]))
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(storedEvents.slice(0, limit).toJS().map(({id}) => id))
      done()
    })
  })
})
describe('backend.getEventsByTypes({eventTypes, fromEventId, limit})', () => {
  let testEventTypes = uniq(testData.events.slice(0, 4).map(e => e.get('type')).toJS())
  let testEvents = testData.events.filter(e => !!~testEventTypes.indexOf(e.get('type')))

  it('should return an Event Emitter', () => {
    let results = backend.getEventsByTypes({
      eventTypes: testEventTypes,
      fromEventId: 0,
      limit: 1
    })
    should(results).be.an.instanceof(EventEmitter)
  })
  it('returned EE should emit `event` for each event fetched', (done) => {
    let results = backend.getEventsByTypes({
      eventTypes: testEventTypes,
      fromEventId: 0
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(testEvents.size)
      done()
    })
  })
  it('returned EE should emit `end` event when all fetched events have been emitted', (done) => {
    let results = backend.getEventsByTypes({
      eventTypes: testEventTypes,
      fromEventId: 0
    })
    let c = 0
    results.on('event', () => {
      c++
    })
    results.on('end', () => {
      should(c).equal(testEvents.size)
      done()
    })
  })
  it('returned EE should emit just `end` if no events are found', (done) => {
    let results = backend.getEventsByTypes({
      eventTypes: testEventTypes,
      fromEventId: 1000000
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(0)
      done()
    })
  })
  it('returned EE should emit the events ordered by `id`', (done) => {
    let results = backend.getEventsByTypes({
      eventTypes: testEventTypes,
      fromEventId: 0
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(testEvents.toJS().map(({id}) => id))
      done()
    })
  })
  it('fetching should get all events with `id` > `fromEventId`', (done) => {
    let storedEvents = testEvents.slice(random(-5, -testEvents.size))
    let results = backend.getEventsByTypes({
      eventTypes: testEventTypes,
      fromEventId: storedEvents.get(0).get('id') - 1
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(storedEvents.size)
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(storedEvents.toJS().map(({id}) => id))
      done()
    })
  })
  it('fetching should take in to account `limit` param if provided', (done) => {
    let storedEvents = testEvents.slice(random(-5, -testEvents.size))
    let limit = random(1, storedEvents.size * 2)
    let results = backend.getEventsByTypes({
      eventTypes: testEventTypes,
      fromEventId: storedEvents.get(0).get('id') - 1,
      limit
    })
    let spy = sinon.spy()
    results.on('event', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(min([limit, storedEvents.size]))
      should(spyCalls.map(({args}) => args[0].id)).containDeepOrdered(storedEvents.slice(0, limit).toJS().map(({id}) => id))
      done()
    })
  })
})
describe('backend.getLastSnapshotOfAggregate({aggregateIdentity})', () => {
  let testAggregateIdentity = testData.snapshots
    .groupBy(s => s.get('aggregateId'))
    .filter(aggSnapshots => aggSnapshots.size > 1)
    .toList()
    .flatten(true)
    .sortBy(() => Math.random())
    .takeLast(1)
    .map(s => ({
      id: s.get('aggregateId'),
      type: s.get('aggregateType')
    }))
    .get(0)

  let storedAggregateSnapshot = testData.snapshots.filter(s =>
    s.get('aggregateId') === testAggregateIdentity.id &&
    s.get('aggregateType') === testAggregateIdentity.type
  ).sortBy(s => -s.get('version')).get(0)
  storedAggregateSnapshot = {
    aggregateIdentity: {
      id: storedAggregateSnapshot.get('aggregateId'),
      type: storedAggregateSnapshot.get('aggregateType')
    },
    version: storedAggregateSnapshot.get('version'),
    data: storedAggregateSnapshot.get('data')
  }

  it('should return an Event Emitter', () => {
    let results = backend.getLastSnapshotOfAggregate({aggregateIdentity: testAggregateIdentity})
    should(results).be.an.instanceof(EventEmitter)
  })
  it('returned EE should emit `snapshot` if a snapshot is found, then `end`', (done) => {
    let results = backend.getLastSnapshotOfAggregate({aggregateIdentity: testAggregateIdentity})
    let spy = sinon.spy()
    results.on('snapshot', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(1)
      done()
    })
  })
  it('returned EE should emit just `end` if a snapshot is not found', (done) => {
    let results = backend.getLastSnapshotOfAggregate({aggregateIdentity: {
      id: 'notexists',
      type: 'notexists'
    }})
    let spy = sinon.spy()
    results.on('snapshot', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(0)
      done()
    })
  })
  it('returned EE should emit just the last snapshot of an aggregate', (done) => {
    let results = backend.getLastSnapshotOfAggregate({aggregateIdentity: testAggregateIdentity})
    let spy = sinon.spy()
    results.on('snapshot', spy)
    results.on('end', () => {
      let spyCalls = spy.getCalls()
      should(spyCalls.length).equal(1)
      should(spyCalls[0].args[0]).deepEqual(storedAggregateSnapshot)
      done()
    })
  })
})

function getClient () {
  return new Promise((resolve, reject) => {
    let client = new pg.Client(cockroachCoordinates)
    client.connect((err) => {
      if (err) return reject(err)
      resolve(client)
    })
  })
}
function flushDB () {
  return getClient()
    .then(client => new Promise((resolve, reject) => {
      client.query(`
        CREATE DATABASE IF NOT EXISTS eventstore;
        DROP TABLE IF EXISTS eventstore.snapshots;
        DROP TABLE IF EXISTS eventstore.events;
        DROP TABLE IF EXISTS eventstore.aggregates`,
        (err) => {
          client.end()
          if (err) return reject(err)
          resolve()
        })
    }))
}
function populateDB () {
  return getClient()
    .then(client => new Promise((resolve, reject) => {
      let aggregatesValues = testData.aggregates.toJS().map(
        ({id, type, version}) => `('${id}', '${type}', ${version})`
      ).join(',')
      let aggregatesInsert = `INSERT INTO eventstore.aggregates VALUES ${aggregatesValues}`

      client.query(aggregatesInsert, (err) => {
        if (err) return reject(err)
        resolve(client)
      })
    }))
    .then(client => new Promise((resolve, reject) => {
      let eventsValues = testData.events.toJS().map(
        ({id, type, aggregateId, aggregateType, storedOn, sequenceNumber, data, metadata, transactionId}) => `(${id}, '${type}', '${aggregateId}', '${aggregateType}', '${storedOn}', ${sequenceNumber}, '${data}', '${metadata}', '${transactionId}')`
      ).join(',')
      let eventsInsert = `INSERT INTO eventstore.events VALUES ${eventsValues}`

      client.query(eventsInsert, (err) => {
        if (err) reject(err)
        resolve(client)
      })
    }))
    .then(client => new Promise((resolve, reject) => {
      let snapshotsValues = testData.snapshots.toJS().map(
        ({aggregateId, aggregateType, version, data}) => `('${aggregateId}', '${aggregateType}', ${version}, '${data}')`
      ).join(',')
      let snapshotsInsert = `INSERT INTO eventstore.snapshots VALUES ${snapshotsValues}`

      client.query(snapshotsInsert, (err) => {
        client.end()
        if (err) return reject(err)
        resolve()
      })
    }))
}
