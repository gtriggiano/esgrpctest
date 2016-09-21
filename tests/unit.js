import should from 'should/as-function'
import sinon from 'sinon'

import EventStore from '../src'

describe('gRPC Event Store Package', function () {
  it('should be fun to work with', () => {})
  it(`var ES = require('grpc-event-store'); typeof ES === 'function'`, () => {
    should(EventStore).be.a.Function()
  })
  it('var es = ES() should log and fail', () => {
    let spy = sinon.spy(console, 'log')
    function trowing () {
      EventStore()
    }
    should(trowing).throw()
    sinon.assert.calledOnce(spy)
    spy.restore()
  })
})
