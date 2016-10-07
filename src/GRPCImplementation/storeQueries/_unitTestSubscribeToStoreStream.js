import should from 'should/as-function'
import { random, max, pick } from 'lodash'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToStoreStream(call)', () => {
  it('should call.write() every live event')
  it('should stop call.write()-ing if client ends subscription')
})
