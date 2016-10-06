import sinon from 'sinon'
import EventEmitter from 'eventemitter3'

import { eventsStreamFromBus } from '../src/utils'

function FixtureGRPCHandlersInterfaces ({fixtureMessageBus} = {}) {
  return {
    backend: FixtureGRPCBackend(),
    store: FixtureGRPCStore(fixtureMessageBus)
  }
}

function FixtureGRPCBackend () {

}

function FixtureGRPCStore (fixtureMessageBus) {
  fixtureMessageBus = fixtureMessageBus || new EventEmitter()

  return {
    eventsStream: eventsStreamFromBus(fixtureMessageBus),
    publishEvents: sinon.spy()
  }
}

export default FixtureGRPCHandlersInterfaces
