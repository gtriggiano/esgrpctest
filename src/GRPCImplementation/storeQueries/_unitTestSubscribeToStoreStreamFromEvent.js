import should from 'should/as-function'
import { random, max, pick } from 'lodash'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToStoreStreamFromEvent(call)', () => {
  it('should call backend.getEvents() with right parameters')
  it('should call.write() the right sequence of fetched and live events')
  it('should stop call.write()-ing if client ends subscription')
})
