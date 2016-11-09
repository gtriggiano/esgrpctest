import should from 'should/as-function'
import sinon from 'sinon'
import EventEmitter from 'eventemitter3'

import ServiceNode from './ServiceNode'

describe('ServiceNode(settings)', function () {
  it('is a function', () => { should(ServiceNode).be.a.Function() })
  it('throws if settings.backendSetupTimeout is not integer or is < 1', () => {
    function throwing () {
      ServiceNode({backendSetupTimeout: ''})
    }
    function throwing2 () {
      ServiceNode({backendSetupTimeout: 0})
    }
    should(throwing).throw()
    should(throwing2).throw()
  })
  it('console.warn()s if settings.backendSetupTimeout is lower than 500', () => {
    sinon.stub(console, 'warn', () => {})
    ServiceNode({backendSetupTimeout: 499})
    should(console.warn.called).equal(true)
    console.warn.restore()
  })
  describe('serviceNode', () => {
    it('is an instance of EventEmitter', () => {
      let node = ServiceNode()
      should(node).be.an.instanceof(EventEmitter)
    })
    it('serviceNode.connect and serviceNode.disconnect are functions', () => {
      let node = ServiceNode()
      should(node.connect).be.a.Function()
      should(node.disconnect).be.a.Function()
    })
  })
})
