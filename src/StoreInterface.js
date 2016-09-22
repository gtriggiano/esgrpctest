import { merge } from 'lodash'
import EventEmitter from 'eventemitter3'
import MessageBus from 'dnsmq-messagebus'

import { prefixString, isValidHost, isValidPort } from './utils'

function StoreInterface (_settings) {
  let settings = merge({}, defaultSettings, _settings)
  _validateSettings(settings)

  let {
    host,
    coordinationPort
  } = settings

  let store = new EventEmitter()

  let _bus = MessageBus(host, {coordinationPort})
  Object.defineProperty(store, 'bus', {value: _bus})

  return store
}

const defaultSettings = {
  coordinationPort: 50061
}

const iMsg = prefixString('[gRPC EventStore StoreInterface]: ')
function _validateSettings (settings) {
  let {
    host,
    coordinationPort
  } = settings

  if (!isValidHost(host)) throw new TypeError(iMsg('settings.host should be a valid string'))
  if (!isValidPort(coordinationPort)) throw new TypeError(iMsg('settings.coordinationPort should be a positive integer'))
}

export default StoreInterface
