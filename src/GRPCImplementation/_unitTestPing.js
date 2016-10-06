import should from 'should/as-function'

import FixtureGRPCHandlersInterfaces from '../../tests/FixtureGRPCHandlersInterfaces'
import FixtureGRPCHandlersParameters from '../../tests/FixtureGRPCHandlersParameters'

import GRPCImplementation from '.'

describe('.ping(_, callback)', () => {
  it('should call callback(null, {})', () => {
    let implementation = GRPCImplementation(FixtureGRPCHandlersInterfaces())
    let { call, callback } = FixtureGRPCHandlersParameters()
    implementation.ping(call, callback)
    should(callback.callCount).equal(1)
    let callArgs = callback.firstCall.args
    should(callArgs[0]).be.Null()
    should(callArgs[1]).be.an.Object()
    should(Object.keys(callArgs[1]).length).equal(0)
  })
})
