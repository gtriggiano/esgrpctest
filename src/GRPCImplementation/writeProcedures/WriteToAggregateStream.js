import shortid from 'shortid'
import { every, min } from 'lodash'

import { isValidString, prefixString } from '../../utils'

function WriteToAggregateStream ({backend, store}) {
  return (call, callback) => {
    let writeRequests
    try {
      writeRequests = [validateAndGetBackendWriteRequest(call.request)]
    } catch (e) {
      return call.emit('error', e)
    }

    let transactionId = shortid()

    let backendResults = backend.storeEvents({writeRequests, transactionId})

    backendResults.on('error', err => {
      backendResults.removeAllListeners()
      call.emit('error', err)
    })
    backendResults.on('storedEvents', storedEvents => {
      backendResults.removeAllListeners()
      store.publishEvents(storedEvents)
      callback(null, storedEvents)
    })
  }
}

function validateAndGetBackendWriteRequest (request, requestIndex) {
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
  validateAndGetBackendWriteRequest
}
