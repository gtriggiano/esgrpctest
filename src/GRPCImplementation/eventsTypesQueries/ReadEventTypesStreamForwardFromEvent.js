import { every, max } from 'lodash'

import { isValidString, eventsStreamFromBackendEmitter } from '../../utils'

function ReadEventTypesStreamForwardFromEvent ({backend}) {
  return (call) => {
    let {eventTypes, fromEventId, limit} = call.request

    // Validate request
    if (!eventTypes.length) return call.emit('error', new TypeError('eventTypes should contain one or more non empty strings'))
    if (!every(eventTypes, isValidString)) return call.emit('error', new TypeError('every item of eventTypes should be a non empty string'))

    fromEventId = max([0, fromEventId])

    let params = {eventTypes, fromEventId}
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

export default ReadEventTypesStreamForwardFromEvent
