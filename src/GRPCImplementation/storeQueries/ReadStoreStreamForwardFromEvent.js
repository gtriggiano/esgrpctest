import { eventsStreamFromBackendEmitter } from '../../utils'

function ReadStoreStreamForwardFromEvent ({backend}) {
  return (call) => {
    let {fromEventId, limit} = call.request

    let params = {fromEventId}
    if (limit > 0) params.limit = limit

    let backendResults = backend.getEventsByTypes(params)
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
