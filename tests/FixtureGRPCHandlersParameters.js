import sinon from 'sinon'

function FixtureCall () {
  return {
    write: sinon.spy(),
    emit: sinon.spy()
  }
}

function FixtureGRPCHandlersParameters () {
  return {
    call: FixtureCall(),
    callback: sinon.spy()
  }
}

export default FixtureGRPCHandlersParameters
