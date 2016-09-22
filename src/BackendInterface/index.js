import { isString, merge, extend } from 'lodash'

import backends from './backends'
import { prefixString } from '../utils'

const availableBackends = Object.keys(backends)
console.log(availableBackends)

function BackendInterface (_settings) {
  let backendInstancePassed = _settings instanceof BackendInterface
  if (backendInstancePassed) return _settings

  let settings = merge({}, defaultSettings, _settings)
  _validateSettings(settings)

  let {
    type
  } = settings

  return backends[type](settings)
}

const defaultSettings = {
  type: 'cockroachdb'
}

const iMsg = prefixString('[gRPC EventStore BackendInterface]: ')
function _validateSettings (settings) {
  let {
    type
  } = settings
  if (!type || !isString(type)) throw new TypeError(iMsg('settings.host should be a valid string'))
  if (!~availableBackends.indexOf(type)) throw new Error(iMsg(`"${type}" backend type is not supported.`))
}

export default BackendInterface
