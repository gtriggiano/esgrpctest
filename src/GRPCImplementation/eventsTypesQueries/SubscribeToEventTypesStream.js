import { every } from 'lodash'

import { isValidString } from '../../utils'

function SubscribeToEventTypesStream ({store}) {
  return (call) => {
    let { eventTypes } = call.request

    // Validate request
    if (!eventTypes.length) return call.emit('error', new TypeError('eventTypes should contain one or more non empty strings'))
    if (!every(eventTypes, isValidString)) return call.emit('error', new TypeError('every item of eventTypes should be a non empty string'))

    let subscription = store.eventsStream
      .filter(({type}) => !!~eventTypes.indexOf(type))
      .subscribe(
        evt => call.write(evt),
        err => call.emit('error', err)
      )

    call.on('end', () => {
      subscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToEventTypesStream
