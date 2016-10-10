import { forEach } from 'lodash'

import apiHandlersFactories from './api'
import { setupConnectionsPool, getConnection } from './helpers/db'
import setupDatabase from './operations/setup'
import { prefixString, isValidString, isPositiveInteger } from './../../../utils'

function CockroachDBBackend (_settings) {
  let settings = {...defaultSettings, ..._settings}
  _validateSettings(settings)

  setupConnectionsPool(settings)

  let backend = {}

  // Public API
  function setup (done) {
    getConnection((err, {client, release}) => {
      if (err) return done(err)
      setupDatabase(client)
        .then(() => done())
        .catch(err => done(err))
        .then(() => release())
    })
  }

  Object.defineProperty(backend, 'setup', {value: setup})
  forEach(apiHandlersFactories, (factory, handlerName) => {
    Object.defineProperty(backend, handlerName, {value: factory(getConnection)})
  })
  return backend
}

const defaultSettings = {
  host: 'localhost',
  port: 26257,
  database: 'eventstore',
  user: 'root',
  max: 10,
  idleTimeoutMillis: 30000
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
