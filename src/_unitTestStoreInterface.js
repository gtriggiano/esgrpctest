import should from 'should/as-function'
import EventEmitter from 'eventemitter3'

import StoreInterface from './StoreInterface'

describe('StoreInterface', function () {
  it('should be a function', () => { should(StoreInterface).be.a.Function() })
})
