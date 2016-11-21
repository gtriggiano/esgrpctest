import ServiceNode from './ServiceNode'
import { EventStoreProtocol } from './GRPCInterface'

let lib = {}
Object.defineProperties(lib, {
  ServiceNode: {enumerable: true, value: ServiceNode},
  EventStoreProtocol: {enumerable: true, value: EventStoreProtocol}
})

module.exports = lib
