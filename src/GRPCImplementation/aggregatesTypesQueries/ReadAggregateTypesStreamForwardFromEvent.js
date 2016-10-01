import { every } from 'lodash'

import { isValidString, eventsStreamFromBackendEmitter } from '../../utils'

function ReadAggregateTypesStreamForwardFromEvent ({backend}) {
  return (call) => {
    let {aggregateTypes, fromEventId, limit} = call.request

    // Validate request
    if (!aggregateTypes.length) return call.emit('error', new TypeError('aggregateTypes should contain one or more non empty strings'))
    if (!every(aggregateTypes, isValidString)) return call.emit('error', new TypeError('every item of aggregateTypes should be a non empty string'))

    let params = {aggregateTypes, fromEventId}
    if (limit > 0) params.limit = limit

    let backendResults = backend.getEventsByAggregateTypes(params)
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

export default ReadAggregateTypesStreamForwardFromEvent
