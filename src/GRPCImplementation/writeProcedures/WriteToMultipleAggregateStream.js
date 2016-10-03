import uuid from 'uuid'

import { validateRequestAndGetBackendParams } from './WriteToAggregateStream'

function WriteToMultipleAggregateStream ({backend, store}) {
  return (call, callback) => {
    let { writeRequests } = call.request

    if (!writeRequests.length) return call.emit('error', new Error('writingRequests should be a list of event storage requests'))

    let params
    try {
      params = writeRequests.map(validateRequestAndGetBackendParams)
    } catch (e) {
      return call.emit('error', e)
    }
    let transactionId = uuid.v4()
    backend.storeEvents(params, transactionId, (err, storedEvents) => {
      if (err) return call.emit('error', err)
      store.publishEvents(storedEvents)
      callback(null, storedEvents)
    })
  }
}

export default WriteToMultipleAggregateStream
