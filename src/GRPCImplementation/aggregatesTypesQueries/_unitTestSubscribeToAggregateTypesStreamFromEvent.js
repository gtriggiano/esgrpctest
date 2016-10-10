import should from 'should/as-function'
import { random, max, sample, sampleSize } from 'lodash'

import InMemorySimulation, { AGGREGATE_TYPES } from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToAggregateTypesStreamFromEvent(call)', () => {
  it('call should emit `error` if call.request.aggregateTypes is not a valid list of strings', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    // No aggregateTypes
    simulation.call.request = {
      aggregateTypes: [],
      fromEventId: 0
    }
    implementation.subscribeToAggregateTypesStreamFromEvent(simulation.call)
    let emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateTypes
    simulation = InMemorySimulation(data)
    simulation.call.request = {
      aggregateTypes: [''],
      fromEventId: 0
    }
    implementation.subscribeToAggregateTypesStreamFromEvent(simulation.call)
    emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)
  })
  it('should call backend.getEventsByAggregateTypes() with right parameters', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateTypes: ['typeOne', 'typeTwo'],
      fromEventId: random(-10, 10),
      limit: random(-10, 10)
    }

    implementation.subscribeToAggregateTypesStreamFromEvent(simulation.call)

    let calls = simulation.backend.getEventsByAggregateTypes.getCalls()
    should(calls.length === 1).be.True()
    should(calls[0].args[0].aggregateTypes).containDeepOrdered(simulation.call.request.aggregateTypes)
    should(calls[0].args[0].fromEventId).equal(max([0, simulation.call.request.fromEventId]))
    should(calls[0].args[0].limit).equal(undefined)
  })
  it('should call.write() the right sequence of fetched and live events about aggregate of given types', (done) => {
    let testAggregateTypes = sampleSize(AGGREGATE_TYPES.toJS(), 2)
    let storedEvents = data.events.filter(evt =>
      !!~testAggregateTypes.indexOf(evt.get('aggregateType'))
    )
    let fromEventId = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('id') > fromEventId)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateTypes: testAggregateTypes,
      fromEventId
    }

    implementation.subscribeToAggregateTypesStreamFromEvent(simulation.call)
    simulation.store.publishEvents([
      {id: 100010, aggregateIdentity: {id: 'anid', type: sample(testAggregateTypes)}},
      {id: 100011, aggregateIdentity: {id: 'other', type: 'other'}},
      {id: 100012, aggregateIdentity: {id: 'anid', type: sample(testAggregateTypes)}}
    ])

    setTimeout(() => {
      let writeCalls = simulation.call.write.getCalls()
      should(writeCalls.length).equal(storedEvents.size + 2)
      should(writeCalls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([100010, 100012])
      simulation.call.emit('end')
      done()
    }, storedEvents.size + 150)
  })
  it('should stop call.write()-ing if client ends subscription', (done) => {
    let testAggregateTypes = sampleSize(AGGREGATE_TYPES.toJS(), 2)
    let storedEvents = data.events.filter(evt =>
      !!~testAggregateTypes.indexOf(evt.get('aggregateType'))
    )
    let fromEventId = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('id') > fromEventId)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateTypes: testAggregateTypes,
      fromEventId
    }

    implementation.subscribeToAggregateTypesStreamFromEvent(simulation.call)

    simulation.store.publishEvents([
      {id: 100010, aggregateIdentity: {id: 'anid', type: sample(testAggregateTypes)}},
      {id: 100011, aggregateIdentity: {id: 'other', type: 'other'}},
      {id: 100012, aggregateIdentity: {id: 'anid', type: sample(testAggregateTypes)}}
    ])

    setTimeout(() => {
      simulation.call.emit('end')
      simulation.store.publishEvents([
        {id: 100013, aggregateIdentity: {id: 'anid', type: sample(testAggregateTypes)}},
        {id: 100014, aggregateIdentity: {id: 'anid', type: sample(testAggregateTypes)}}
      ])
    }, 200)
    setTimeout(() => {
      let calls = simulation.call.write.getCalls()
      should(calls.map(({args}) => args[0] && args[0].id)).not.containDeepOrdered([100013, 100014])
      done()
    }, 350)
  })
})
