import should from 'should/as-function'

import FixtureGRPCHandlersInterfaces from '../tests/FixtureGRPCHandlersInterfaces'

import GRPCImplementation from './GRPCImplementation'

describe('GRPCImplementation({backend, store})', () => {
  it('should be a function', () => should(GRPCImplementation).be.a.Function())
  it('should return a map of functions', () => {
    let implementation = GRPCImplementation(FixtureGRPCHandlersInterfaces())
    should(implementation).be.an.Object()
    Object.keys(implementation).forEach(
      handler => should(implementation[handler]).be.a.Function()
    )
  })
  require('./GRPCImplementation/_unitTestPing')
  require('./GRPCImplementation/_unitTestGetUid')
  require('./GRPCImplementation/aggregatesQueries/_unitTestSubscribeToAggregateStream')
  require('./GRPCImplementation/aggregatesQueries/_unitTestSubscribeToAggregateStreamFromVersion')
})
