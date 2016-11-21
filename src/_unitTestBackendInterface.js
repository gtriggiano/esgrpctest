import { sample, each } from 'lodash'
import should from 'should/as-function'
import sinon from 'sinon'

import BackendInterface, { CustomBackendWrapper } from './BackendInterface'
import backends from './BackendInterface/backends'
const availableBackends = Object.keys(backends)

describe('BackendInterface(settings)', function () {
  it('is a function', () => { should(BackendInterface).be.a.Function() })
  it('returns `settings.backend` if `settings` is an instance of CustomBackendWrapper', () => {
    let s = {}
    let settings = new CustomBackendWrapper(s)
    let out = BackendInterface(settings)
    should(out === settings.backend).be.True()
  })
  it('throws if `settings.type` is not a string with length > 0', () => {
    function throwing () {
      BackendInterface({type: ''})
    }
    function throwing1 () {
      BackendInterface({type: 1})
    }
    should(throwing).throw()
    should(throwing1).throw()
  })
  it(`throws if \`settings.type\` is not one of [${availableBackends.join(', ')}]`, () => {
    function throwing () {
      BackendInterface({type: 'xxxxxxxx'})
    }
    should(throwing).throw()
  })
  it('calls the appropriate backend factory and return its output', () => {
    let spies = availableBackends.reduce((spies, type) => {
      let spy = sinon.spy(backends, type)
      spies[type] = spy
      return spies
    }, {})
    let backendType = sample(availableBackends)
    let backend = BackendInterface({type: backendType})
    should(spies[backendType].calledOnce).be.True()
    should(spies[backendType].returned(backend)).be.True()
    each(spies, spy => spy.restore())
  })
  describe('.customBackend(backendInstance)', () => {
    it('returns an instance of CustomBackendWrapper with `backendInstance` as .backend property', () => {
      let backendInstance = {}
      let out = BackendInterface.customBackend(backendInstance)
      should(out instanceof CustomBackendWrapper).be.True()
      should(out.backend === backendInstance).be.True()
    })
  })
})
