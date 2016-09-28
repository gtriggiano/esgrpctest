import should from 'should/as-function'
import EventEmitter from 'eventemitter3'

import EventStore from '../src'

describe('gRPC Event Store Package Unit Tests', function () {
  it('should be fun to work with', () => {})
  it(`let EventStore = require('grpc-event-store'); typeof EventStore === 'function'`, () => {
    should(EventStore).be.a.Function()
  })
  it(`let eventStoreNode = EventStore(); eventStoreNode instanceof EventEmitter === true`, () => {
    let eventStore = EventStore()
    should(eventStore).be.an.instanceof(EventEmitter)
  })

  require('../src/_unitTestUtils')
  require('../src/_unitTestBackendInterface')
  require('../src/_unitTestStoreInterface')
  require('../src/_unitTestGRPCInterface')
  require('../src/_unitTestServiceNode')
})
