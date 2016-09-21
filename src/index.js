import ServiceNode, { defaultSettings, validateCtorInput } from './ServiceNode'

function CreateEventStoreNode (host, _settings) {
  _settings = _settings || {}
  let settings = Object.assign({}, defaultSettings, _settings)

  validateCtorInput(host, settings)
  return ServiceNode(host, settings)
}

export default CreateEventStoreNode
