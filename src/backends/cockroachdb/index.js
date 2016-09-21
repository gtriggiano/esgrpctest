function CockroachDBBackend (settings) {
  let instance = this instanceof CockroachDBBackend
  if (!instance) return new CockroachDBBackend(settings)
}

const defaultSettings = {

}

const validateCtorInput = (settings) => {

}

Object.assign(CockroachDBBackend, {
  defaultSettings,
  validateCtorInput
})

export default CockroachDBBackend
