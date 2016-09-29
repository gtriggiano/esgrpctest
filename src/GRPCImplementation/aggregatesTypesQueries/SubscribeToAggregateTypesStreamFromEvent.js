import Rx from 'rxjs'

import { every, pull } from 'lodash'

import { isValidString } from '../../utils'

function SubscribeToAggregateTypesStreamFromEvent ({backend, store}) {
  return (call) => {
    // Validate and parse input
    let { aggregateTypes, fromEventId } = call.request
    if (!every(aggregateTypes, isValidString)) return call.emit('error', new TypeError('aggregateTypes should be a list of non empty strings'))
    fromEventId = fromEventId >= 0 ? fromEventId : 0

    // Call backend
    let params = {aggregateTypes, fromEventId}
    let backendResults = backend.getEventsByAggregateTypes(params)

    // Build observables
    let endOfPastEvents = Rx.Observable.fromEvent(backendResults, 'end').take(1)
    let pastEvents = Rx.Observable.fromEvent(backendResults, 'event').takeUntil(endOfPastEvents)
    let liveEvents = store.eventsStream
                      .filter(({aggregateIdentity}) => !!~aggregateTypes.indexOf(aggregateIdentity.type))
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

export default SubscribeToAggregateTypesStreamFromEvent
