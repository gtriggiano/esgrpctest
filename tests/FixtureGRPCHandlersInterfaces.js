import sinon from 'sinon'
import EventEmitter from 'eventemitter3'

import { eventsStreamFromBus } from '../src/utils'

function FixtureGRPCHandlersInterfaces ({fixtureMessageBus, storedEvents} = {}) {
  return {
    backend: FixtureGRPCBackend(storedEvents),
    store: FixtureGRPCStore(fixtureMessageBus)
  }
}

function FixtureGRPCBackend (storedEvents) {
  return {
    getEventsByAggregate: backendFetchingApi(storedEvents)
  }
}
function backendFetchingApi (storedEvents = []) {
  return sinon.spy(() => {
    let ee = new EventEmitter()
    storedEvents.forEach((evt, idx) => {
      let i = idx
      setTimeout(() => {
        ee.emit('event', storedEvents[i])
      }, (idx + 1) * 10)
    })
    setTimeout(() => {
      ee.emit('end')
    }, (storedEvents.length + 1) * 10)
    return ee
  })
}

function FixtureGRPCStore (fixtureMessageBus) {
  fixtureMessageBus = fixtureMessageBus || new EventEmitter()

  return {
    eventsStream: eventsStreamFromBus(fixtureMessageBus),
    publishEvents: sinon.spy()
  }
}

export default FixtureGRPCHandlersInterfaces
