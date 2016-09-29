import Rx from 'rxjs'
import { pull } from 'lodash'

import { isValidString } from '../../utils'

function SubscribeToAggregateStreamFromVersion ({backend, store}) {
  return (call) => {
    // Validate and parse input
    let { aggregateIdentity, fromVersion } = call.request
    if (!aggregateIdentity) return call.emit('error', new TypeError('aggregateIdentity cannot be undefined'))
    if (!isValidString(aggregateIdentity.uuid)) return call.emit('error', new TypeError('aggregateIdentity.uuid should be a non empty string'))
    if (!isValidString(aggregateIdentity.type)) return call.emit('error', new TypeError('aggregateIdentity.type should be a non empty string'))
    fromVersion = fromVersion >= 0 ? fromVersion : 0

    let { uuid, type } = aggregateIdentity

    // Call backend
    let params = {aggregateIdentity, fromVersion}
    let backendResults = backend.getEventsByAggregate(params)

    // Build observables
    let endOfPastEvents = Rx.Observable.fromEvent(backendResults, 'end').take(1)
    let pastEvents = Rx.Observable.fromEvent(backendResults, 'event').takeUntil(endOfPastEvents)
    let liveEvents = store.eventsStream
                      .filter(({aggregateIdentity}) => aggregateIdentity.uuid === uuid && aggregateIdentity.type === type)
    let allEvents = pastEvents.concat(liveEvents)

    // Stream to client
    let streamedEventsIds = []
    let subscription = allEvents.subscribe(evt => {
      if (~streamedEventsIds.indexOf(evt.id)) return
      streamedEventsIds.push(evt.id)
      call.write(evt)
      setTimeout(() => pull(streamedEventsIds, evt.id), 1000)
    })

    call.on('end', () => {
      subscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToAggregateStreamFromVersion
