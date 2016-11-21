import shortid from 'shortid'
import { every, max } from 'lodash'

import { isValidString, prefixString } from '../../utils'

function WriteToAggregateStream ({backend, store}) {
  return (call, callback) => {
    let writeRequests
    try {
      writeRequests = [validateAndGetBackendWriteRequest(call.request)]
    } catch (e) {
      return callback(e)
    }

    let transactionId = shortid()

    let backendResults = backend.storeEvents({writeRequests, transactionId})

    backendResults.on('error', err => {
      backendResults.removeAllListeners()
      callback(err)
    })
    backendResults.on('storedEvents', storedEvents => {
      backendResults.removeAllListeners()
      store.publishEvents(storedEvents)
      callback(null, {events: storedEvents})
    })
  }
}

function validateAndGetBackendWriteRequest (request, requestIndex) {
  let eMgs = prefixString(requestIndex !== undefined ? `[writing request ${requestIndex}]` : '')

  let { aggregateIdentity, expectedAggregateVersion, events, snapshot } = request

  // Validate request
  if (!aggregateIdentity) throw new TypeError(eMgs('aggregateIdentity cannot be undefined'))
  if (!isValidString(aggregateIdentity.id)) throw new TypeError(eMgs('aggregateIdentity.id should be a nonempty string'))
  if (!isValidString(aggregateIdentity.type)) throw new TypeError(eMgs('aggregateIdentity.type should be a nonempty string'))
  if (!events || !events.length) throw new Error(eMgs('events should be a nonempty list of events to store'))
  if (!every(events, ({type}) => isValidString(type))) throw new TypeError(eMgs('all events should have a valid type'))

  expectedAggregateVersion = max([-1, expectedAggregateVersion])

  let params = {
    aggregateIdentity,
    events: events.map(e => ({
      type: e.type,
      data: e.data || '',
      metadata: e.metadata || ''
    })),
    expectedAggregateVersion
  }
  if (snapshot) params.snapshot = snapshot
  return params
}

export default WriteToAggregateStream
export {
  validateAndGetBackendWriteRequest
}
