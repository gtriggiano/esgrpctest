import should from 'should/as-function'
import { random, max, pick } from 'lodash'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.readAggregateStreamForwardFromVersion(call)', () => {
  it('call should emit `error` if call.request.aggregateIdentity is not a valid aggregateIdentity', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    // No aggregateIdentity
    simulation.call.request = {
      fromVersion: 0
    }
    implementation.readAggregateStreamForwardFromVersion(simulation.call)
    let emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateIdentity.id
    simulation = InMemorySimulation(data)
    simulation.call.request = {
      aggregateIdentity: {id: '', type: 'test'},
      fromVersion: 0
    }
    implementation.readAggregateStreamForwardFromVersion(simulation.call)
    emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateIdentity.type
    simulation = InMemorySimulation(data)
    simulation.call.request = {
      aggregateIdentity: {id: 'test', type: ''},
      fromVersion: 0
    }
    implementation.readAggregateStreamForwardFromVersion(simulation.call)
    emitArgs = simulation.call.emit.firstCall.args

    should(simulation.call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)
  })
  it('should call backend.getEventsByAggregate() with right parameters', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateIdentity: {id: 'uid', type: 'test'},
      fromVersion: random(-10, 10),
      limit: random(-10, 10)
    }

    implementation.readAggregateStreamForwardFromVersion(simulation.call)

    let calls = simulation.backend.getEventsByAggregate.getCalls()
    should(calls.length === 1).be.True()
    should(calls[0].args[0].aggregateIdentity).containEql(simulation.call.request.aggregateIdentity)
    should(calls[0].args[0].fromVersion).equal(max([0, simulation.call.request.fromVersion]))
    should(calls[0].args[0].limit).equal(
      simulation.call.request.limit < 1 ? undefined : simulation.call.request.limit
    )
  })
  it('should call.write() the right sequence of fetched events about aggregate', (done) => {
    let testAggregate = data.aggregates.get(random(data.aggregates.size - 1))
    let storedEvents = data.events.filter(evt =>
      evt.get('aggregateId') === testAggregate.get('id') &&
      evt.get('aggregateType') === testAggregate.get('type')
    )
    let minVersion = random(1, storedEvents.size)
    storedEvents = storedEvents.filter(evt => evt.get('sequenceNumber') > minVersion)
    let limit = random(storedEvents.size)
    if (limit) storedEvents = storedEvents.slice(0, limit)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateIdentity: pick(testAggregate.toJS(), ['id', 'type']),
      fromVersion: minVersion,
      limit
    }

    implementation.readAggregateStreamForwardFromVersion(simulation.call)

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

    implementation.readAggregateStreamForwardFromVersion(simulation.call)

    setTimeout(() => {
      let writeCalls = simulation.call.write.getCalls()
      should(writeCalls.length).equal(storedEvents.size)
      should(simulation.call.end.calledOnce).be.True()
      done()
    }, storedEvents.size + 10)
  })
  it('should stop call.write()-ing if client ends subscription', (done) => {
    let testAggregate = data.aggregates.get(random(data.aggregates.size - 1))
    let simulation = InMemorySimulation(data)
    let storedEvents = data.events.filter(evt =>
      evt.get('aggregateId') === testAggregate.get('id') &&
      evt.get('aggregateType') === testAggregate.get('type')
    )

    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      aggregateIdentity: pick(testAggregate.toJS(), ['id', 'type']),
      fromVersion: 0
    }

    implementation.readAggregateStreamForwardFromVersion(simulation.call)
    simulation.call.emit('end')

    setTimeout(() => {
      should(simulation.call.end.calledOnce).be.True()
      should(simulation.call.write.getCalls().length).equal(0)
      done()
    }, storedEvents.size + 10)
  })
})
