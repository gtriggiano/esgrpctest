import { merge } from 'lodash'

import ServiceNode, { defaultSettings, validateCtorInput } from './ServiceNode'

function CreateEventStoreNode (host, _settings) {
  _settings = _settings || {}
  let settings = merge({}, defaultSettings, _settings)

  validateCtorInput(host, settings)
  return ServiceNode(host, settings)
}

export default CreateEventStoreNode
