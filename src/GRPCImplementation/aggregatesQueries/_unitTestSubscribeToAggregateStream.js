import should from 'should/as-function'
import EventEmitter from 'eventemitter3'

import FixtureGRPCHandlersInterfaces from '../../../tests/FixtureGRPCHandlersInterfaces'
import FixtureGRPCHandlersParameters from '../../../tests/FixtureGRPCHandlersParameters'

import GRPCImplementation from '..'

describe('.subscribeToAggregateStream(call)', () => {
  it('should emit `error` on call if call.request is not a valid aggregateIdentity', () => {
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
  it('should call.write() every live event about aggregate', (done) => {
    let aggregateIdentity = {id: 'uid', type: 'Test'}
    let fixtureMessageBus = new EventEmitter()
    let implementation = GRPCImplementation(FixtureGRPCHandlersInterfaces({fixtureMessageBus}))

    let call = FixtureGRPCHandlersParameters().call
    call.request = {id: 'uid', type: 'Test'}
    implementation.subscribeToAggregateStream(call)
    fixtureMessageBus.emit('StoredEvents', JSON.stringify([
      {id: 3, aggregateIdentity},
      {id: 2, aggregateIdentity: {id: 'other', type: 'other'}},
      {id: 1, aggregateIdentity}
    ]))
    setTimeout(function () {
      let writeCalls = call.write.getCalls()
      should(writeCalls.length).equal(2)
      should(writeCalls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([1, 3])
      call.emit('end')
      done()
    }, 500)
  })
  it('should stop call.write()-ing if client ends subscription', (done) => {
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
