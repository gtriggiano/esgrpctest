import should from 'should/as-function'
import sinon from 'sinon'

import EventStore from '../src'
import ServiceNode from '../src/ServiceNode'

describe('gRPC Event Store Package', function () {
  it('should be fun to work with', () => {})
  it(`let EventStore = require('grpc-event-store'); typeof EventStore === 'function'`, () => {
    should(EventStore).be.a.Function()
  })
  it(`let eventStoreNode = EventStore(); eventStoreNode instanceof ServiceNode === true`, () => {
    let eventStoreNode = EventStore()
    should(eventStoreNode).be.an.instanceof(ServiceNode)
  })
})
