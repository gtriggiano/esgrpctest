import Rx from 'rxjs'

import { eventsStreamFromBackendEmitter } from '../../utils'

function SubscribeToStoreStreamFromEvent ({backend, store}) {
  return (call) => {
    let {fromEventId} = call.request

    // Call backend
    let params = {fromEventId}
    let backendResults = backend.getEvents(params)
    let backendStream = eventsStreamFromBackendEmitter(backendResults)

    // Cache live events until backendStream ends
    let replay = new Rx.ReplaySubject()
    let cachedLiveStream = store.eventsStream.multicast(replay)
    let cachedLiveStreamSubscription = cachedLiveStream.connect()
    function _endCachedLiveStream () {
      cachedLiveStreamSubscription.unsubscribe()
      replay.complete()
      // release memory
      process.nextTick(() => replay._events.splice(0))
    }
    backendStream.toPromise().then(_endCachedLiveStream, _endCachedLiveStream)

    // Concat the streams and subscribe
    let eventsStream = backendStream.concat(cachedLiveStream, store.eventsStream)
    let eventsStreamSubscription = eventsStream.subscribe(
      evt => call.write(evt),
      err => call.emit('error', err)
    )

    call.on('end', () => {
      _endCachedLiveStream()
      eventsStreamSubscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToStoreStreamFromEvent
