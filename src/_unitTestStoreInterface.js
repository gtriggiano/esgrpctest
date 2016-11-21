import should from 'should/as-function'
import EventEmitter from 'eventemitter3'
import Rx from 'rxjs'

import StoreInterface from './StoreInterface'

describe('StoreInterface([settings])', function () {
  it('is a function', () => { should(StoreInterface).be.a.Function() })
  it('throws if `settings.host` is not a string with length > 0', () => {
    function throwing () {
      StoreInterface({host: ''})
    }
    function throwing1 () {
      StoreInterface({host: 1})
    }
    should(throwing).throw()
    should(throwing1).throw()
  })
  it('throws if `settings.coordinationPort` is not a positive integer', () => {
    function throwing () {
      StoreInterface({coordinationPort: 0})
    }
    function throwing1 () {
      StoreInterface({coordinationPort: ''})
    }
    should(throwing).throw()
    should(throwing1).throw()
  })
  describe('storeIface', () => {
    it('is an instanceof EventEmitter', () => {
      let iface = StoreInterface()
      should(iface instanceof EventEmitter).be.True()
    })
    it('storeIface.eventStream is an instance of Rx.ConnectableObservable', () => {
      let iface = StoreInterface()
      should(iface.eventsStream).be.an.instanceof(Rx.ConnectableObservable)
    })
    it('storeIface.connect, storeIface.disconnect and storeIface.publishEvents are functions', () => {
      let iface = StoreInterface()
      should(iface.connect).be.a.Function()
      should(iface.disconnect).be.a.Function()
      should(iface.publishEvents).be.a.Function()
    })
  })
})
