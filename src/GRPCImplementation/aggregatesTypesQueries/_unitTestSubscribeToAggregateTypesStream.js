import should from 'should/as-function'
import { random, max, pick } from 'lodash'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToAggregateTypesStream(call)', () => {
  it('call should emit `error` if call.request.aggregateTypes is not a valid list of strings')
  it('should call.write() every live event about aggregate of given types')
  it('should stop call.write()-ing if client ends subscription')
})
