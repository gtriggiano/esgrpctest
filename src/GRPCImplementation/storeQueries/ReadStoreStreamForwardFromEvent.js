import { max } from 'lodash'

import { eventsStreamFromBackendEmitter } from '../../utils'

function ReadStoreStreamForwardFromEvent ({backend}) {
  return (call) => {
    let {fromEventId, limit} = call.request

    fromEventId = max([0, fromEventId])

    let params = {fromEventId}
    if (limit > 0) params.limit = limit

    let backendResults = backend.getEvents(params)
    let eventsStream = eventsStreamFromBackendEmitter(backendResults)
    let subscription = eventsStream.subscribe(
      evt => call.write(evt),
      err => call.emit('error', err),
      () => call.end()
    )

    call.on('end', () => {
      subscription.unsubscribe()
      call.end()
    })
  }
}

export default ReadStoreStreamForwardFromEvent
