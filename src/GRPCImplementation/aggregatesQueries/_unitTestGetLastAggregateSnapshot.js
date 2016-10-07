import should from 'should/as-function'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.getLastAggregateSnapshot', () => {
  it('should call callback(err) if call.request is not a valid aggregateIdentity', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    // Bad aggregateIdentity.id
    simulation.call.request = {id: '', type: 'test'}
    implementation.getLastAggregateSnapshot(simulation.call, simulation.callback)
    let callbackArgs = simulation.callback.firstCall.args

    should(simulation.callback.calledOnce).be.True()
    should(callbackArgs[0]).be.an.instanceof(Error)

    // Bad aggregateIdentity.type
    simulation = InMemorySimulation(data)
    simulation.call.request = {id: 'test', type: ''}
    implementation.getLastAggregateSnapshot(simulation.call, simulation.callback)
    callbackArgs = simulation.callback.firstCall.args

    should(simulation.callback.calledOnce).be.True()
    should(callbackArgs[0]).be.an.instanceof(Error)
  })
  it('should be more tested')
})
