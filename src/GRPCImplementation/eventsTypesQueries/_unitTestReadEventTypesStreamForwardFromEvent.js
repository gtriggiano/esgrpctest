import should from 'should/as-function'
import { random, max, sampleSize } from 'lodash'

import InMemorySimulation, { EVENT_TYPES } from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.readEventTypesStreamForwardFromEvent(call)', () => {
  it('call should emit `error` if call.request.eventTypes is not a valid list of strings', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    // No eventTypes
    simulation.call.request = {
      eventTypes: [],
      fromEventId: 0
    }
    implementation.readEventTypesStreamForwardFromEvent(simulation.call)
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
    implementation.readEventTypesStreamForwardFromEvent(simulation.call)
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
      fromEventId: random(-10, 10)
    }

    implementation.readEventTypesStreamForwardFromEvent(simulation.call)

    let calls = simulation.backend.getEventsByTypes.getCalls()
    should(calls.length === 1).be.True()
    should(calls[0].args[0].eventTypes).containDeepOrdered(simulation.call.request.eventTypes)
    should(calls[0].args[0].fromEventId).equal(max([0, simulation.call.request.fromEventId]))
  })
  it('should call.write() the right sequence of fetched events', (done) => {
    let testEventTypes = sampleSize(EVENT_TYPES.toJS(), 2)
    let simulation = InMemorySimulation(data)
    let storedEvents = data.events.filter(evt =>
      !!~testEventTypes.indexOf(evt.get('type'))
    )
    let fromEventId = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('id') > fromEventId)

    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      eventTypes: testEventTypes,
      fromEventId
    }

    implementation.readEventTypesStreamForwardFromEvent(simulation.call)

    setTimeout(() => {
      let writeCalls = simulation.call.write.getCalls()
      should(writeCalls.length).equal(storedEvents.size)
      should(writeCalls.map(({args}) => args[0] && args[0].id)).containDeepOrdered(
        storedEvents.toJS().map(({id}) => id)
      )
      done()
    }, storedEvents.size + 10)
  })
  it('call should .end() after all the stored events are written', (done) => {
    let testEventTypes = sampleSize(EVENT_TYPES.toJS(), 2)
    let simulation = InMemorySimulation(data)
    let storedEvents = data.events.filter(evt =>
      !!~testEventTypes.indexOf(evt.get('type'))
    )
    let fromEventId = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('id') > fromEventId)

    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      eventTypes: testEventTypes,
      fromEventId
    }

    implementation.readEventTypesStreamForwardFromEvent(simulation.call)

    setTimeout(() => {
      should(simulation.call.end.calledOnce).be.True()
      done()
    }, storedEvents.size + 10)
  })
  it('should stop call.write()-ing if client ends subscription', (done) => {
    let testEventTypes = sampleSize(EVENT_TYPES.toJS(), 2)
    let simulation = InMemorySimulation(data)
    let storedEvents = data.events.filter(evt =>
      !!~testEventTypes.indexOf(evt.get('type'))
    )
    let fromEventId = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('id') > fromEventId)

    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      eventTypes: testEventTypes,
      fromEventId
    }

    implementation.readEventTypesStreamForwardFromEvent(simulation.call)
    simulation.call.emit('end')

    setTimeout(() => {
      should(simulation.call.end.calledOnce).be.True()
      should(simulation.call.write.getCalls().map(({args}) => args[0] && args[0].id)).not.containDeepOrdered(storedEvents.takeLast(1).toJS().map(({id}) => id))
      done()
    }, storedEvents.size + 10)
  })
})
