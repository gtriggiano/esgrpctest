import Rx from 'rxjs'
import { max } from 'lodash'

import { isValidString, eventsStreamFromBackendEmitter } from '../../utils'

function SubscribeToAggregateStreamFromVersion ({backend, store}) {
  return (call) => {
    let { aggregateIdentity, fromVersion } = call.request

    // Validate request
    if (!aggregateIdentity) return call.emit('error', new TypeError('aggregateIdentity cannot be undefined'))
    if (!isValidString(aggregateIdentity.id)) return call.emit('error', new TypeError('aggregateIdentity.id should be a non empty string'))
    if (!isValidString(aggregateIdentity.type)) return call.emit('error', new TypeError('aggregateIdentity.type should be a non empty string'))

    let { id, type } = aggregateIdentity
    fromVersion = max([0, fromVersion])

    // Call backend
    let params = {aggregateIdentity, fromVersion}
    let backendResults = backend.getEventsByAggregate(params)
    let backendStream = eventsStreamFromBackendEmitter(backendResults)

    // Filter on store.eventsStream
    let liveStream = store.eventsStream
      .filter(({aggregateIdentity, sequenceNumber}) =>
        aggregateIdentity.id === id &&
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
      _endCachedLiveStream()
      eventsStreamSubscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToAggregateStreamFromVersion
