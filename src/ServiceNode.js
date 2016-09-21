function ServiceNode (host, settings) {
  let instance = this instanceof ServiceNode
  if (!instance) return new ServiceNode(host, settings)
}

const defaultSettings = {

}

const validateCtorInput = (host, _settings) => {

}

export default ServiceNode
export {
  defaultSettings,
  validateCtorInput
}
