import { merge } from 'lodash'
import EventEmitter from 'eventemitter3'

import { prefixString, isValidString, isPositiveInteger } from './../../../utils'

function CockroachDBBackend (_settings) {
  let settings = merge({}, defaultSettings, _settings)
  _validateSettings(settings)

  let backend = {}

  // Public API
  function setup (done) { done() }

  Object.defineProperty(backend, 'setup', {value: setup})
  return backend
}

const defaultSettings = {
  host: 'localhost',
  port: 1234,
  database: 'eventstore',
  user: 'root'
}

const iMsg = prefixString('[gRPC EventStore Backend CockroachDB]: ')
function _validateSettings (settings) {
  let {
    host,
    port,
    database,
    user
  } = settings

  if (!isValidString(host)) throw new TypeError(iMsg('settings.host should be a valid string'))
  if (!isPositiveInteger(port)) throw new TypeError(iMsg('settings.port should be a positive integer'))
  if (!isValidString(database)) throw new TypeError(iMsg('settings.database should be a valid string'))
  if (!isValidString(user)) throw new TypeError(iMsg('settings.user should be a valid string'))
}

export default CockroachDBBackend
