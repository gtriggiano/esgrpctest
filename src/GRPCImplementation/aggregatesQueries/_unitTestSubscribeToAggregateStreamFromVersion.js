import should from 'should/as-function'
import { random, max, pick } from 'lodash'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToAggregateStreamFromVersion(call)', () => {
  it('emits `error` on call if call.request.aggregateIdentity is not a valid aggregateIdentity', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    // No aggregateIdentity
    simulation.call.request = {}
    implementation.subscribeToAggregateStream(simulation.call)
    let emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateIdentity.id
    simulation = InMemorySimulation(data)
    simulation.call.request = {aggregateIdentity: {id: '', type: 'test'}}
    implementation.subscribeToAggregateStream(simulation.call)
    emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateIdentity.type
    simulation = InMemorySimulation(data)
    simulation.call.request = {aggregateIdentity: {id: 'test', type: ''}}
    implementation.subscribeToAggregateStream(simulation.call)
    emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)
  })
  it('invokes backend.getEventsByAggregate() with right parameters', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateIdentity: {id: 'uid', type: 'test'},
      fromVersion: random(-10, 10),
      limit: random(-10, 10)
    }

    implementation.subscribeToAggregateStreamFromVersion(simulation.call)

    let calls = simulation.backend.getEventsByAggregate.getCalls()
    should(calls.length === 1).be.True()
    should(calls[0].args[0].aggregateIdentity).containEql(simulation.call.request.aggregateIdentity)
    should(calls[0].args[0].fromVersion).equal(max([0, simulation.call.request.fromVersion]))
    should(calls[0].args[0].limit).equal(undefined)
  })
  it('invokes call.write() for every fetched and live event of aggregate, in the right sequence', (done) => {
    let testAggregate = data.aggregates.get(random(data.aggregates.size - 1))
    let simulation = InMemorySimulation(data)
    let storedEvents = data.events.filter(evt =>
      evt.get('aggregateId') === testAggregate.get('id') &&
      evt.get('aggregateType') === testAggregate.get('type')
    )
    let minVersion = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('sequenceNumber') > minVersion)

    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateIdentity: pick(testAggregate.toJS(), ['id', 'type']),
      fromVersion: minVersion
    }

    implementation.subscribeToAggregateStreamFromVersion(simulation.call)

    let nextAggregateVersion = testAggregate.get('version') + 1
    simulation.store.publishEvents([
      {id: 100010, aggregateIdentity: simulation.call.request.aggregateIdentity, sequenceNumber: nextAggregateVersion++},
      {id: 100011, aggregateIdentity: {id: 'other', type: 'other'}},
      {id: 100012, aggregateIdentity: simulation.call.request.aggregateIdentity, sequenceNumber: nextAggregateVersion++},
      {id: 100013, aggregateIdentity: simulation.call.request.aggregateIdentity, sequenceNumber: nextAggregateVersion++},
      {id: 100014, aggregateIdentity: {id: 'other', type: 'other'}},
      {id: 100015, aggregateIdentity: simulation.call.request.aggregateIdentity, sequenceNumber: nextAggregateVersion++}
    ])

    setTimeout(() => {
      let writeCalls = simulation.call.write.getCalls()
      should(writeCalls.length).equal(storedEvents.size + 4)
      should(writeCalls.map(({args}) => args[0] && args[0].id)).containDeepOrdered(
        storedEvents.toJS().map(({id}) => id).concat([100010, 100012, 100013, 100015])
      )
      simulation.call.emit('end')
      done()
    }, storedEvents.size + 200)
  })
  it('stops invoking call.write() if client ends subscription', (done) => {
    let testAggregate = data.aggregates.get(random(data.aggregates.size - 1))
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateIdentity: pick(testAggregate.toJS(), ['id', 'type']),
      fromVersion: 1
    }

    implementation.subscribeToAggregateStreamFromVersion(simulation.call)

    simulation.store.publishEvents([
      {id: 100010, aggregateIdentity: simulation.call.request.aggregateIdentity, data: ''},
      {id: 100011, aggregateIdentity: simulation.call.request.aggregateIdentity, data: ''}
    ])

    setTimeout(() => {
      simulation.call.emit('end')
      simulation.store.publishEvents([
        {id: 100012, aggregateIdentity: simulation.call.request.aggregateIdentity, data: ''},
        {id: 100013, aggregateIdentity: simulation.call.request.aggregateIdentity, data: ''}
      ])
    }, 300)
    setTimeout(() => {
      let calls = simulation.call.write.getCalls()
      should(calls.map(({args}) => args[0] && args[0].id)).not.containDeepOrdered([100012, 100013])
      done()
    }, 500)
  })
})
