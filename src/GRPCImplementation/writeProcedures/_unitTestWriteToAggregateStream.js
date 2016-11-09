import should from 'should/as-function'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.writeToAggregateStream(call, callback)', () => {
  it('invokes callback(error) if call.request.aggregateIdentity is not a valid aggregateIdentity')
  it('invokes callback(error) if call.request.events is not a nonempty list of valid events to store')
  it('invokes backend.storeEvents() with right parameters')
  it('invokes callback(err) if there is an error writing the events')
  it('invokes callback(null, {events}) if the events writing is succcessful')
})
