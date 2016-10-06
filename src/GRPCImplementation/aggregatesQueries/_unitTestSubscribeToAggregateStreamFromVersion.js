import should from 'should/as-function'
import { random, max } from 'lodash'
import EventEmitter from 'eventemitter3'

import FixtureGRPCHandlersInterfaces from '../../../tests/FixtureGRPCHandlersInterfaces'
import FixtureGRPCHandlersParameters from '../../../tests/FixtureGRPCHandlersParameters'

import GRPCImplementation from '..'

describe('.subscribeToAggregateStreamFromVersion(call)', () => {
  it('call should emit `error` if call.request.aggregateIdentity is not a valid aggregateIdentity', () => {
    let implementation = GRPCImplementation(FixtureGRPCHandlersInterfaces())

    // No aggregateIdentity
    let call = FixtureGRPCHandlersParameters().call
    call.request = {}
    implementation.subscribeToAggregateStream(call)
    let emitArgs = call.emit.firstCall.args

    should(call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateIdentity.id
    call = FixtureGRPCHandlersParameters().call
    call.request = {aggregateIdentity: {id: '', type: 'test'}}
    implementation.subscribeToAggregateStream(call)
    emitArgs = call.emit.firstCall.args

    should(call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateIdentity.type
    call = FixtureGRPCHandlersParameters().call
    call.request = {aggregateIdentity: {id: 'test', type: ''}}
    implementation.subscribeToAggregateStream(call)
    emitArgs = call.emit.firstCall.args

    should(call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)
  })
  it('should call backend.getEventsByAggregate() with right parameters', () => {
    let {backend, store} = FixtureGRPCHandlersInterfaces()
    let implementation = GRPCImplementation({backend, store})

    let call = FixtureGRPCHandlersParameters().call
    call.request = {
      aggregateIdentity: {id: 'uid', type: 'test'},
      fromVersion: random(-10, 10)
    }

    implementation.subscribeToAggregateStreamFromVersion(call)

    let calls = backend.getEventsByAggregate.getCalls()
    should(calls.length === 1).be.True()
    should(calls[0].args[0].aggregateIdentity).containEql(call.request.aggregateIdentity)
    should(calls[0].args[0].fromVersion).equal(max([-1, call.request.fromVersion]))
  })
  it('should call.write() the right sequence of fetched and live events about aggregate', (done) => {
    let aggregateIdentity = {id: 'id', type: 'Test'}
    let fixtureMessageBus = new EventEmitter()
    let storedEvents = [
      {id: 1, aggregateIdentity, sequenceNumber: 1},
      {id: 2, aggregateIdentity, sequenceNumber: 2}
    ]
    let {store, backend} = FixtureGRPCHandlersInterfaces({
      fixtureMessageBus,
      storedEvents
    })
    let implementation = GRPCImplementation({store, backend})
    let call = FixtureGRPCHandlersParameters().call
    call.request = {
      aggregateIdentity,
      fromVersion: 0
    }

    implementation.subscribeToAggregateStreamFromVersion(call)
    fixtureMessageBus.emit('StoredEvents', JSON.stringify([
      {id: 5, aggregateIdentity, sequenceNumber: 4},
      {id: 4, aggregateIdentity: {id: 'other', type: 'other'}},
      {id: 3, aggregateIdentity, sequenceNumber: 3}
    ]))
    setTimeout(() => {
      fixtureMessageBus.emit('StoredEvents', JSON.stringify([
        {id: 6, aggregateIdentity, sequenceNumber: 5},
        {id: 7, aggregateIdentity: {id: 'other', type: 'other'}},
        {id: 8, aggregateIdentity, sequenceNumber: 6}
      ]))
    }, 200)
    setTimeout(() => {
      let writeCalls = call.write.getCalls()
      should(writeCalls.length).equal(6)
      should(writeCalls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([1, 2, 3, 5, 6, 8])
      call.emit('end')
      done()
    }, 350)
  })
})
