import shortid from 'shortid'
import { uniq } from 'lodash'

import { validateAndGetBackendWriteRequest } from './WriteToAggregateStream'

function WriteToMultipleAggregateStream ({backend, store}) {
  return (call, callback) => {
    let { writeRequests } = call.request

    if (!writeRequests.length) return call.emit('error', new Error('writingRequests should be a list of event storage requests'))

    try {
      writeRequests = writeRequests.map(validateAndGetBackendWriteRequest)
    } catch (e) {
      return call.emit('error', e)
    }

    // Check that there is just one request for every aggregate
    let involvedAggregates = uniq(writeRequests.map(({aggregateIdentity}) => `${aggregateIdentity.type}${aggregateIdentity.uuid}`))
    if (involvedAggregates.length < writeRequests.length) return call.emit('error', new Error('each writeRequest should concern a different aggregate'))

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

export default WriteToMultipleAggregateStream
