import should from 'should/as-function'
import sinon from 'sinon'

import ServiceNode from './ServiceNode'

describe('ServiceNode(settings)', function () {
  it('should be a function', () => { should(ServiceNode).be.a.Function() })
  it('should throw if settings.backendSetupTimeout is not integer or is < 1', () => {
    function throwing () {
      ServiceNode({backendSetupTimeout: ''})
    }
    function throwing2 () {
      ServiceNode({backendSetupTimeout: 0})
    }
    should(throwing).throw()
    should(throwing2).throw()
  })
  it('should warn if settings.backendSetupTimeout is lower than 500', () => {
    let stub = sinon.stub(console, 'warn', () => {})
    ServiceNode({backendSetupTimeout: 499})
    should(stub.called).equal(true)
    stub.restore()
  })
})
