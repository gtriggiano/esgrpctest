import should from 'should/as-function'
import { random, max, sample, sampleSize } from 'lodash'

import InMemorySimulation, { EVENT_TYPES } from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToEventTypesStreamFromEvent(call)', () => {
  it('call should emit `error` if call.request.eventTypes is not a valid list of strings', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    // No eventTypes
    simulation.call.request = {
      eventTypes: [],
      fromEventId: 0
    }
    implementation.subscribeToEventTypesStreamFromEvent(simulation.call)
    let emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad eventTypes
    simulation = InMemorySimulation(data)
    simulation.call.request = {
      eventTypes: [''],
      fromEventId: 0
    }
    implementation.subscribeToEventTypesStreamFromEvent(simulation.call)
    emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)
  })
  it('should call backend.getEventsByTypes() with right parameters', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      eventTypes: ['typeOne', 'typeTwo'],
      fromEventId: random(-10, 10),
      limit: random(-10, 10)
    }

    implementation.subscribeToEventTypesStreamFromEvent(simulation.call)

    let calls = simulation.backend.getEventsByTypes.getCalls()
    should(calls.length === 1).be.True()
    should(calls[0].args[0].eventTypes).containDeepOrdered(simulation.call.request.eventTypes)
    should(calls[0].args[0].fromEventId).equal(max([0, simulation.call.request.fromEventId]))
    should(calls[0].args[0].limit).equal(undefined)
  })
  it('should call.write() the right sequence of fetched and live events with type within the given types', (done) => {
    let testTypes = sampleSize(EVENT_TYPES.toJS(), 2)
    let storedEvents = data.events.filter(evt =>
      !!~testTypes.indexOf(evt.get('type'))
    )
    let fromEventId = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('id') > fromEventId)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      eventTypes: testTypes,
      fromEventId
    }

    implementation.subscribeToEventTypesStreamFromEvent(simulation.call)
    simulation.store.publishEvents([
      {id: 100010, type: sample(testTypes)},
      {id: 100011, type: 'other'},
      {id: 100012, type: sample(testTypes)}
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
    let testTypes = sampleSize(EVENT_TYPES.toJS(), 2)
    let storedEvents = data.events.filter(evt =>
      !!~testTypes.indexOf(evt.get('type'))
    )
    let fromEventId = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('id') > fromEventId)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      eventTypes: testTypes,
      fromEventId
    }

    implementation.subscribeToEventTypesStreamFromEvent(simulation.call)

    simulation.store.publishEvents([
      {id: 100010, type: sample(testTypes)},
      {id: 100011, type: 'other'},
      {id: 100012, type: sample(testTypes)}
    ])

    setTimeout(() => {
      simulation.call.emit('end')
      simulation.store.publishEvents([
        {id: 100013, type: sample(testTypes)},
        {id: 100014, type: sample(testTypes)}
      ])
    }, 200)
    setTimeout(() => {
      let calls = simulation.call.write.getCalls()
      should(calls.map(({args}) => args[0] && args[0].id)).not.containDeepOrdered([100013, 100014])
      done()
    }, 350)
  })
})
