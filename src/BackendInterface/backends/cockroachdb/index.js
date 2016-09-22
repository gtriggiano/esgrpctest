import { isString, merge } from 'lodash'

import { prefixString } from './../../../utils'

function CockroachDBBackend (_settings) {
  let settings = merge({}, defaultSettings, _settings)
  _validateSettings(settings)
}

const defaultSettings = {
  host: 'localhost',
  port: 1234,
  database: 'eventstore',
  user: 'root'
}

function _validateSettings (settings) {
  let {
    host,
    port,
    database,
    user
  } = settings

  if (!host || !isString(host)) throw new TypeError()
}

export default CockroachDBBackend
