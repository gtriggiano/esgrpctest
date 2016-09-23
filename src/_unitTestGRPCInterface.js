import should from 'should/as-function'
import EventEmitter from 'eventemitter3'

import GRPCInterface from './GRPCInterface'

describe('GRPCInterface', function () {
  it('should be a function', () => { should(GRPCInterface).be.a.Function() })
  it('let iface = GRPCInterface(); iface instanceof EventEmitter === true', () => {
    let iface = GRPCInterface()
    should(iface).be.an.instanceof(EventEmitter)
  })
})
