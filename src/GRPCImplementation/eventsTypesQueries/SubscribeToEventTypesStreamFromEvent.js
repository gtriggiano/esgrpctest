import Rx from 'rxjs'

import { every } from 'lodash'

import { isValidString, eventsStreamFromBackendEmitter } from '../../utils'

function SubscribeToEventTypesStreamFromEvent ({backend, store}) {
  return (call) => {
    let { eventTypes, fromEventId } = call.request

    // Validate request
    if (!eventTypes.length) return call.emit('error', new TypeError('eventTypes should contain one or more non empty strings'))
    if (!every(eventTypes, isValidString)) return call.emit('error', new TypeError('every item of eventTypes should be a non empty string'))
    fromEventId = fromEventId >= -1 ? fromEventId : -1

    // Call backend
    let params = {eventTypes, fromEventId}
    let backendResults = backend.getEventsByAggregateTypes(params)
    let backendStream = eventsStreamFromBackendEmitter(backendResults)

    // Filter on store.eventsStream
    let liveStream = store.eventsStream
      .filter(({id, type}) =>
        !!~eventTypes.indexOf(type) &&
        id > fromEventId
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

export default SubscribeToEventTypesStreamFromEvent
