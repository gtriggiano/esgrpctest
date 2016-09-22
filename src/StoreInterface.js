import { merge } from 'lodash'
import { prefixString } from './utils'

function StoreInterface (_settings) {
  let settings = merge({}, defaultSettings, _settings)
  _validateSettings(settings)
}

const defaultSettings = {

}

const iMsg = prefixString('[gRPC EventStore StoreInterface]: ')
function _validateSettings (settings) {

}

export default StoreInterface
