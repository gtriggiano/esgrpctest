import { merge, isArray } from 'lodash'
import EventEmitter from 'eventemitter3'
import { DNSNode } from 'dnsmq-messagebus'

import { prefixString, isValidString, isPositiveInteger, eventStreamFromBus } from './utils'

function StoreInterface (_settings) {
  let settings = merge({}, defaultSettings, _settings)
  _validateSettings(settings)

  let {
    host,
    coordinationPort
  } = settings

  let store = new EventEmitter()

  // Private API
  let _bus = DNSNode(host, {coordinationPort})
  let _eventsStream = eventStreamFromBus(_bus, 50)
  _bus.subscribe('StoredEvents')
  _bus.on('connect', () => store.emit('connect'))
  _bus.on('disconnect', () => store.emit('disconnect'))

  // Public API
  function connect () {
    _bus.connect()
  }
  function disconnect () {
    _bus.disconnect()
  }
  function publishEvents (events) {
    let eventsString = JSON.stringify(isArray(events) ? events : [events])
    _bus.publish('StoredEvents', eventsString)
  }

  Object.defineProperty(store, 'eventsStream', {value: _eventsStream})
  Object.defineProperty(store, 'connect', {value: connect})
  Object.defineProperty(store, 'disconnect', {value: disconnect})
  Object.defineProperty(store, 'publishEvents', {value: publishEvents})
  return store
}

const defaultSettings = {
  host: 'localhost',
  coordinationPort: 50061
}

const iMsg = prefixString('[gRPC EventStore StoreInterface]: ')
function _validateSettings (settings) {
  let {
    host,
    coordinationPort
  } = settings

  if (!isValidString(host)) throw new TypeError(iMsg('settings.host should be a valid string'))
  if (!isPositiveInteger(coordinationPort)) throw new TypeError(iMsg('settings.coordinationPort should be a positive integer'))
}

export default StoreInterface
