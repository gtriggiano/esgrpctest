import should from 'should/as-function'
import sinon from 'sinon'
import EventEmitter from 'eventemitter3'

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
  it('should console.warn() if settings.backendSetupTimeout is lower than 500', () => {
    sinon.stub(console, 'warn', () => {})
    ServiceNode({backendSetupTimeout: 499})
    should(console.warn.called).equal(true)
    console.warn.restore()
  })
  describe('serviceNode', () => {
    it('should be an instance of EventEmitter', () => {
      let node = ServiceNode()
      should(node).be.an.instanceof(EventEmitter)
    })
    it('serviceNode.connect and serviceNode.disconnect should be functions', () => {
      let node = ServiceNode()
      should(node.connect).be.a.Function()
      should(node.disconnect).be.a.Function()
    })
  })
})
