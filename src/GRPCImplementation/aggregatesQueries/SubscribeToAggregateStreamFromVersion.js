import Rx from 'rxjs'

import { isValidString, eventsStreamFromBackendEmitter } from '../../utils'

function SubscribeToAggregateStreamFromVersion ({backend, store}) {
  return (call) => {
    let { aggregateIdentity, fromVersion } = call.request

    // Validate request
    if (!aggregateIdentity) return call.emit('error', new TypeError('aggregateIdentity cannot be undefined'))
    if (!isValidString(aggregateIdentity.uuid)) return call.emit('error', new TypeError('aggregateIdentity.uuid should be a non empty string'))
    if (!isValidString(aggregateIdentity.type)) return call.emit('error', new TypeError('aggregateIdentity.type should be a non empty string'))

    let { uuid, type } = aggregateIdentity
    fromVersion = fromVersion >= -1 ? fromVersion : -1

    // Call backend
    let params = {aggregateIdentity, fromVersion}
    let backendResults = backend.getEventsByAggregate(params)
    let backendStream = eventsStreamFromBackendEmitter(backendResults)

    // Filter on store.eventsStream
    let liveStream = store.eventsStream
      .filter(({aggregateIdentity, sequenceNumber}) =>
        aggregateIdentity.uuid === uuid &&
        aggregateIdentity.type === type &&
        sequenceNumber > fromVersion
      )

    // Cache live events until backendStream ends
    let replay = new Rx.ReplaySubject()
    let cachedLiveStream = liveStream.multicast(replay)
    let cachedLiveStreamSubscription = cachedLiveStream.connect()
    function _endCachedLiveStream () {
      cachedLiveStreamSubscription.unsubscribe()
      replay.complete()
      // release memory
      process.nextTick(() => replay._events.splice(0))
    }
    backendStream.toPromise().then(_endCachedLiveStream, _endCachedLiveStream)

    // Concat the streams and subscribe
    let eventsStream = backendStream.concat(cachedLiveStream, liveStream)
    let eventsStreamSubscription = eventsStream.subscribe(
      evt => call.write(evt),
      err => call.emit('error', err)
    )

    call.on('end', () => {
      eventsStreamSubscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToAggregateStreamFromVersion
