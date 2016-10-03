import uuid from 'uuid'
import { every, min } from 'lodash'

import { isValidString, prefixString } from '../../utils'

function WriteToAggregateStream ({backend, store}) {
  return (call, callback) => {
    let params = [validateRequestAndGetBackendParams(call.request)]
    let transactionId = uuid.v4()
    backend.storeEvents(params, transactionId, (err, storedEvents) => {
      if (err) return call.emit('error', err)
      store.publishEvents(storedEvents)
      callback(null, storedEvents)
    })
  }
}

function validateRequestAndGetBackendParams (request, requestIndex) {
  let eMgs = prefixString(requestIndex !== undefined ? `[writing request ${requestIndex}]` : '')

  let { aggregateIdentity, expectedAggregateVersion, events, snapshot } = request

  // Validate request
  if (!aggregateIdentity) throw new TypeError(eMgs('aggregateIdentity cannot be undefined'))
  if (!isValidString(aggregateIdentity.uuid)) throw new TypeError(eMgs('aggregateIdentity.uuid should be a non empty string'))
  if (!isValidString(aggregateIdentity.type)) throw new TypeError(eMgs('aggregateIdentity.type should be a non empty string'))
  if (!events.length) throw new Error(eMgs('events should be a list of events to store'))
  if (!every(events, ({type}) => isValidString(type))) throw new TypeError(eMgs('events should have a valid type'))

  expectedAggregateVersion = min([-1, expectedAggregateVersion])

  let params = {
    aggregateIdentity,
    events,
    expectedAggregateVersion
  }
  if (snapshot) params.snapshot = snapshot
  return params
}

export default WriteToAggregateStream
export {
  validateRequestAndGetBackendParams
}
