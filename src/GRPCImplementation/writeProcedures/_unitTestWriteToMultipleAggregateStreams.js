import should from 'should/as-function'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.writeToMultipleAggregateStreams(call, callback)', function () {
  it('invokes callback(error) if !call.request.writeRequests.length')
  it('invokes callback(error) if anyone of call.request.writeRequests is not a valid writeRequest')
  it('invokes callback(error) if each writeRequest does not concerns a different aggregate')
  it('invokes backend.storeEvents() with right parameters')
  it('invokes callback(err) if there is an error executing any of the writeRequests')
  it('invokes callback(null, {events}) if the events writing is succcessful')
})
