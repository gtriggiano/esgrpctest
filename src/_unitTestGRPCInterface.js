import should from 'should/as-function'
import EventEmitter from 'eventemitter3'
import grpc from 'grpc'

import GRPCInterface from './GRPCInterface'

describe('GRPCInterface(settings)', function () {
  it('should be a function', () => { should(GRPCInterface).be.a.Function() })
  it('should throw if `settings.port` is not a positive integer', () => {
    function notThrowing () {
      GRPCInterface({port: 1})
    }
    function throwing () {
      GRPCInterface({port: 0})
    }
    function throwing1 () {
      GRPCInterface({port: ''})
    }
    should(notThrowing).not.throw()
    should(throwing).throw()
    should(throwing1).throw()
  })
  it('should throw if `settings.credentials is not an instance of grpc.ServerCredentials`', () => {
    function notThrowing () {
      GRPCInterface({credentials: grpc.ServerCredentials.createInsecure()})
    }
    function throwing () {
      GRPCInterface({credentials: {}})
    }
    should(notThrowing).not.throw()
    should(throwing).throw()
  })
  describe('grpcIface', () => {
    it('should be an instance of EventEmitter', () => {
      let grpcIface = GRPCInterface()
      should(grpcIface).be.an.instanceof(EventEmitter)
    })
    it('grpcIface.connect and grpcIface.disconnect should be functions', () => {
      let iface = GRPCInterface()
      should(iface.connect).be.a.Function()
      should(iface.disconnect).be.a.Function()
    })
  })
})
