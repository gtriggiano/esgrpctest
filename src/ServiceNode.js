import grpc from 'grpc'
import util from 'util'
import { isString, isObject, isFunction, merge } from 'lodash'
import EventEmitter from 'eventemitter3'

import backendsIfaces from './backends'
import createGRPCServer from './gRPCImplementation/createServer'
import StoreClusterIface, {
  defaultSettings as defaultClusterSettings,
  validateCtorInput as validateStoreClusterInput
} from './StoreClusterIface'
import { prefix } from './utils'

function ServiceNode (host, settings) {
  let instance = this instanceof ServiceNode
  if (!instance) return new ServiceNode(host, settings)

  // Emitter inheritance
  EventEmitter.call(this)

  let serviceNode = this

  let {
    rpcPort,
    rpcCredentials,
    backend,
    cluster
  } = settings

  // Private API
  let _connected = false

  // Get backend ctor
  let BackendIface = backendsIfaces[backend.type]
  // Get backend settings
  let backendSettings = merge({}, BackendIface.defaultSettings, backend.settings)
  // Get cluster setings
  let clusterSettings = merge({}, defaultClusterSettings, cluster)

  // Validate backend settings
  BackendIface.validateCtorInput(backendSettings)
  // Validate cluster settings
  validateStoreClusterInput(host, clusterSettings)

  // Get the backend interface
  let _backendIface = BackendIface(backendSettings)
  // Get the cluster interface
  let _clusterIface = StoreClusterIface(host, clusterSettings)

  // Get a gRPC server instance
  let _grpcServer = createGRPCServer({
    backend: _backendIface,
    cluster: _clusterIface
  })

  // Public api
  this.connect = (cb) => {
    if (_connected) return serviceNode
    _grpcServer.bind(`0.0.0.0:${rpcPort}`, rpcCredentials)
    _grpcServer.start()
    _connected = true
    serviceNode.emit('connect')
    return serviceNode
  }
  this.disconnect = (cb) => {
    if (!_connected) return serviceNode
    _grpcServer.tryShutdown(() => {
      serviceNode.emit('disconnect')
      if (isFunction(cb)) cb()
    })
  }
}

util.inherits(ServiceNode, EventEmitter)

const defaultSettings = {
  rpcPort: 52546,
  rpcCredentials: grpc.ServerCredentials.createInsecure(),
  backend: {
    type: 'cockroachdb'
  }
}

const ctorMsg = prefix('[gRPC EventStore ServiceNode constructor]: ')
const availableBackends = Object.keys(backendsIfaces)

const validateCtorInput = (host, settings) => {
  let {
    backend
  } = settings

  // host
  if (!host || !isString(host)) throw new TypeError(ctorMsg('host parameter should be a string'))

  // settings.backend
  if (!isObject(backend)) throw new TypeError(ctorMsg('settings.backend should be an object'))
  if (!~availableBackends.indexOf(backend.type)) throw new Error(ctorMsg(`settings.backend.type should be one of [${availableBackends.join(', ')}]`))
}

export default ServiceNode
export {
  defaultSettings,
  validateCtorInput
}
