import sinon from 'sinon'
import EventEmitter from 'eventemitter3'

function FixtureCall () {
  let call = new EventEmitter()
  sinon.spy(call, 'on')
  sinon.spy(call, 'emit')
  sinon.spy(call, 'removeAllListeners')
  call.write = sinon.spy()
  call.end = sinon.spy()

  return call
}

function FixtureGRPCHandlersParameters () {
  return {
    call: FixtureCall(),
    callback: sinon.spy()
  }
}

export default FixtureGRPCHandlersParameters
