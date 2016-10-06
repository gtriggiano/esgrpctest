import should from 'should/as-function'
import EventEmitter from 'eventemitter3'

import FixtureGRPCHandlersInterfaces from '../../../tests/FixtureGRPCHandlersInterfaces'
import FixtureGRPCHandlersParameters from '../../../tests/FixtureGRPCHandlersParameters'

import GRPCImplementation from '..'

describe('.subscribeToAggregateStream(call)', () => {
  it('call should emit `error` if call.request is not a valid aggregateIdentity', () => {
    let implementation = GRPCImplementation(FixtureGRPCHandlersInterfaces())

    // Bad aggregateIdentity.id
    let call = FixtureGRPCHandlersParameters().call
    call.request = {id: '', type: 'test'}
    implementation.subscribeToAggregateStream(call)
    let emitArgs = call.emit.firstCall.args

    should(call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)

    // Bad aggregateIdentity.type
    call = FixtureGRPCHandlersParameters().call
    call.request = {id: 'test', type: ''}
    implementation.subscribeToAggregateStream(call)
    emitArgs = call.emit.firstCall.args

    should(call.emit.calledOnce).be.True()
    should(emitArgs[0]).equal('error')
    should(emitArgs[1]).be.an.instanceof(Error)
  })
  it('should write to call stream every event about aggregate', (done) => {
    let fixtureMessageBus = new EventEmitter()
    let implementation = GRPCImplementation(FixtureGRPCHandlersInterfaces({fixtureMessageBus}))

    let call = FixtureGRPCHandlersParameters().call
    call.request = {id: 'uid', type: 'Test'}
    implementation.subscribeToAggregateStream(call)

    fixtureMessageBus.emit('StoredEvents', JSON.stringify([
      {id: 3, aggregateIdentity: {id: 'uid', type: 'Test'}, data: ''},
      {id: 2, aggregateIdentity: {id: 'uid-a', type: 'Another'}, data: ''},
      {id: 1, aggregateIdentity: {id: 'uid', type: 'Test'}, data: ''}
    ]))

    setTimeout(function () {
      let calls = call.write.getCalls()
      should(calls.length).equal(2)
      should(calls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([1, 3])
      call.emit('end')
      done()
    }, 500)
  })
  it('should stop writing to call stream if client ends subscription', (done) => {
    let fixtureMessageBus = new EventEmitter()
    let implementation = GRPCImplementation(FixtureGRPCHandlersInterfaces({fixtureMessageBus}))

    let call = FixtureGRPCHandlersParameters().call
    call.request = {id: 'uid', type: 'Test'}
    implementation.subscribeToAggregateStream(call)

    fixtureMessageBus.emit('StoredEvents', JSON.stringify([
      {id: 1, aggregateIdentity: {id: 'uid', type: 'Test'}, data: ''},
      {id: 2, aggregateIdentity: {id: 'uid', type: 'Test'}, data: ''}
    ]))

    setTimeout(() => {
      call.emit('end')
      fixtureMessageBus.emit('StoredEvents', JSON.stringify([
        {id: 3, aggregateIdentity: {id: 'uid', type: 'Test'}, data: ''},
        {id: 4, aggregateIdentity: {id: 'uid', type: 'Test'}, data: ''}
      ]))
    }, 200)
    setTimeout(() => {
      let calls = call.write.getCalls()
      should(calls.length).equal(2)
      should(calls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([1, 2])
      done()
    }, 400)
  })
})
