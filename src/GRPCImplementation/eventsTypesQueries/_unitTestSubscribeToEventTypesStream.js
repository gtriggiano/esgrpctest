import should from 'should/as-function'
import { sample, sampleSize } from 'lodash'

import InMemorySimulation, { EVENT_TYPES } from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToEventTypesStream(call)', () => {
  it('emits `error` on call if call.request.eventTypes is not a valid list of strings', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    // No eventTypes
    simulation.call.request = {
      eventTypes: [],
      fromEventId: 0
    }
    implementation.subscribeToEventTypesStream(simulation.call)
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
    implementation.subscribeToEventTypesStream(simulation.call)
    emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)
  })
  it('invokes call.write() for every live event with type within the given types', (done) => {
    let testEventTypes = sampleSize(EVENT_TYPES.toJS(), 2)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      eventTypes: testEventTypes
    }
    implementation.subscribeToEventTypesStream(simulation.call)
    simulation.store.publishEvents([
      {id: 100010, type: sample(testEventTypes)},
      {id: 100011, type: 'other'},
      {id: 100012, type: sample(testEventTypes)}
    ])

    setTimeout(() => {
      let writeCalls = simulation.call.write.getCalls()
      should(writeCalls.length).equal(2)
      should(writeCalls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([100010, 100012])
      simulation.call.emit('end')
      done()
    }, 150)
  })
  it('stops invoking call.write() if client ends subscription', (done) => {
    let testEventTypes = sampleSize(EVENT_TYPES.toJS(), 2)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      eventTypes: testEventTypes
    }
    implementation.subscribeToEventTypesStream(simulation.call)
    simulation.store.publishEvents([
      {id: 100010, type: sample(testEventTypes)},
      {id: 100011, type: 'other'},
      {id: 100012, type: sample(testEventTypes)}
    ])

    setTimeout(() => {
      simulation.call.emit('end')
      simulation.store.publishEvents([
        {id: 100013, type: sample(testEventTypes)},
        {id: 100014, type: sample(testEventTypes)}
      ])
    }, 200)

    setTimeout(() => {
      let calls = simulation.call.write.getCalls()
      should(calls.length).equal(2)
      should(calls.map(({args}) => args[0] && args[0].id)).not.containDeepOrdered([100013, 100014])
      done()
    }, 350)
  })
})
