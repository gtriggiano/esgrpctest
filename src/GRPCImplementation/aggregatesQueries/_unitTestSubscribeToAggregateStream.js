import should from 'should/as-function'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToAggregateStream(call)', () => {
  it('should emit `error` on call if call.request is not a valid aggregateIdentity', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    // Bad aggregateIdentity.id
    simulation.call.request = {id: '', type: 'test'}
    implementation.subscribeToAggregateStream(simulation.call)
    let emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateIdentity.type
    simulation = InMemorySimulation(data)
    simulation.call.request = {id: 'test', type: ''}
    implementation.subscribeToAggregateStream(simulation.call)
    emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)
  })
  it('should call.write() every live event about aggregate', (done) => {
    let aggregateIdentity = {id: 'uid', type: 'Test'}
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = aggregateIdentity
    implementation.subscribeToAggregateStream(simulation.call)
    simulation.store.publishEvents([
      {id: 100010, aggregateIdentity},
      {id: 100011, aggregateIdentity: {id: 'other', type: 'other'}},
      {id: 100012, aggregateIdentity}
    ])
    setTimeout(function () {
      let writeCalls = simulation.call.write.getCalls()
      should(writeCalls.length).equal(2)
      should(writeCalls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([100010, 100012])
      simulation.call.emit('end')
      done()
    }, 300)
  })
  it('should stop call.write()-ing if client ends subscription', (done) => {
    let aggregateIdentity = {id: 'uid', type: 'Test'}
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = aggregateIdentity
    implementation.subscribeToAggregateStream(simulation.call)

    simulation.store.publishEvents([
      {id: 100010, aggregateIdentity, data: ''},
      {id: 100011, aggregateIdentity, data: ''}
    ])

    setTimeout(() => {
      simulation.call.emit('end')
      simulation.store.publishEvents([
        {id: 100012, aggregateIdentity, data: ''},
        {id: 100013, aggregateIdentity, data: ''}
      ])
    }, 200)
    setTimeout(() => {
      let calls = simulation.call.write.getCalls()
      should(calls.length).equal(2)
      should(calls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([100010, 100011])
      done()
    }, 400)
  })
})
