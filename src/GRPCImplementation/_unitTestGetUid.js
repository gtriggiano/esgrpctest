import should from 'should/as-function'
import shortid from 'shortid'

import FixtureGRPCHandlersInterfaces from '../../tests/FixtureGRPCHandlersInterfaces'
import FixtureGRPCHandlersParameters from '../../tests/FixtureGRPCHandlersParameters'

import GRPCImplementation from '.'

describe('.getUid(_, callback)', () => {
  it('should call callback(null, {uid})', () => {
    let implementation = GRPCImplementation(FixtureGRPCHandlersInterfaces())
    let { call, callback } = FixtureGRPCHandlersParameters()
    implementation.getUid(call, callback)
    should(callback.callCount).equal(1)
    let callArgs = callback.firstCall.args
    should(callArgs[0]).be.Null()
    should(callArgs[1]).be.an.Object()
    should(shortid.isValid(callArgs[1].uid)).be.True()
  })
})
