import grpc from 'grpc'
import { assign } from 'lodash'
import EventEmitter from 'eventemitter3'

const PROTOCOL_FILE_PATH = `${__dirname}/../gRPCEventStore.proto`
const EventStoreProtocol = grpc.load(PROTOCOL_FILE_PATH).gRPCEventStore

import GRPCImplementation from './GRPCImplementation'
import { prefixString, isPositiveInteger } from './utils'

function GRPCInterface (_settings) {
  let settings = assign({}, defaultSettings, _settings)
  _validateSettings(settings)

  let grpcInstance = new EventEmitter()

  // Settings
  let {
    port,
    credentials,
    backend,
    store
  } = settings

  // Private API
  let _connected = false
  let _connecting = false
  let _disconnecting = false
  let _grpcServer = new grpc.Server()
  _grpcServer.addProtoService(EventStoreProtocol.Api.service, GRPCImplementation({backend, store}))

  // Public API
  function connect () {
    if (_connected || _connecting || _disconnecting) return grpcInstance

    _connecting = true
    _grpcServer.bind(`0.0.0.0:${port}`, credentials)
    _grpcServer.start()
    grpcInstance.emit('connect')
    _connected = true
    _connecting = false
    return grpcInstance
  }
  function disconnect () {
    if (!_connected || _connecting || _disconnecting) return grpcInstance

    _disconnecting = true
    _grpcServer.tryShutdown(() => {
      _connected = false
      _disconnecting = false
      grpcInstance.emit('disconnect')
    })
    setTimeout(function () {
      if (!_connected) return
      _grpcServer.forceShutdown()
      _connected = false
      _disconnecting = false
      grpcInstance.emit('disconnect')
    }, 500)

    return grpcInstance
  }

  Object.defineProperty(grpcInstance, 'connect', {value: connect})
  Object.defineProperty(grpcInstance, 'disconnect', {value: disconnect})
  return grpcInstance
}

const defaultSettings = {
  port: 50051,
  credentials: grpc.ServerCredentials.createInsecure()
}

const iMsg = prefixString('[gRPC EventStore GRPCInterface]: ')
function _validateSettings (settings) {
  let {
    port,
    credentials
  } = settings

  if (!isPositiveInteger(port)) throw new TypeError(iMsg('settings.port should be a positive integer'))
  if (!(credentials instanceof grpc.ServerCredentials)) throw new TypeError(iMsg('settings.credentials should be an instance of grpc.ServerCredentials'))
}

export default GRPCInterface
