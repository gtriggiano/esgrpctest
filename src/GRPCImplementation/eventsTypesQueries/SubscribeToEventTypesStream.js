import { every } from 'lodash'

import { isValidString } from '../../utils'

function SubscribeToEventTypesStream ({store}) {
  return (call) => {
    let { eventTypes } = call.request
    if (!every(eventTypes, isValidString)) return call.emit('error', new TypeError('eventTypes should be a list of non empty strings'))

    let subscription = store.eventsStream
                        .filter(({type}) => !!~eventTypes.indexOf(type))
                        .subscribe(evt => call.write(evt))

    call.on('end', () => {
      subscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToEventTypesStream
