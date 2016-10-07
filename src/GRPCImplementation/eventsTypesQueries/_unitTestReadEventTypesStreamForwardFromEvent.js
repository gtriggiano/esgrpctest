import should from 'should/as-function'
import { random, max, pick } from 'lodash'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.readEventTypesStreamForwardFromEvent(call)', () => {
  it('call should emit `error` if call.request.eventTypes is not a valid list of strings')
  it('should call backend.getEventsByTypes() with right parameters')
  it('should call.write() the right sequence of fetched events')
  it('call should .end() after all the stored events are written')
  it('should stop call.write()-ing if client ends subscription')
})
