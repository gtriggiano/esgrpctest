import { isInteger, merge } from 'lodash'
import EventEmitter from 'eventemitter3'

import BackendInterface from './BackendInterface'
import GRPCInterface from './GRPCInterface'
import StoreInterface from './StoreInterface'
import { prefixString, timeoutCallback } from './utils'

function ServiceNode (_settings) {
  let settings = merge({}, defaultSettings, _settings)
  _validateSettings(settings)

  let node = new EventEmitter()

  let {
    host,
    port,
    credentials,
    backendSetupTimeout,
    backend,
    cluster
  } = settings

  // Private API
  let _connected = false
  let _connecting = false
  let _disconnecting = false
  let _backend = BackendInterface(backend)
  let _backendSetupTimeout = timeoutCallback(backendSetupTimeout, iMsg(`Backend setup timed out.`))
  let _store = StoreInterface({host, ...cluster})
  let _grpc = GRPCInterface({port, credentials, backend: _backend, store: _store})

  // Public api
  function connect () {
    if (_connected || _connecting || _disconnecting) return node
    _connecting = true

    _backend.setup(_backendSetupTimeout((err) => {
      if (err) {
        _connecting = false
        console.error(err)
        return
      }
      _store.bus.once('connect', () => _grpc.connect())
      _grpc.once('connect', () => {
        _connected = true
        _connecting = false
        node.emit('connect')
      })
      _store.bus.connect()
    }))
    return node
  }
  function disconnect () {
    if (!_connected || _connecting || _disconnecting) return node
    _disconnecting = true

    _grpc.once('disconnect', () => _store.bus.disconnect())
    _store.bus.once('disconnect', () => {
      _connected = false
      _disconnecting = true
      node.emit('disconnect')
    })
    _grpc.disconnect()
    return node
  }

  Object.assign(node, {connect, disconnect})
  return node
}

const defaultSettings = {
  host: 'localhost',
  port: 1234,
  backendSetupTimeout: 1000,
  backend: {
    type: 'cockroachdb',
    host: 'localhost',
    port: 1234,
    database: 'eventstore',
    user: 'root'
  },
  cluster: {
    coordinationPort: 50061
  }
}

const iMsg = prefixString('[gRPC EventStore ServiceNode]: ')
function _validateSettings (settings) {
  let {
    backendSetupTimeout
  } = settings
  if (!isInteger(backendSetupTimeout) || backendSetupTimeout < 1) throw new TypeError(iMsg('settings.setupTimeout should be a positive integer'))
}

export default ServiceNode
