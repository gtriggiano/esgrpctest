import { every } from 'lodash'

import { isValidString } from '../../utils'

function SubscribeToAggregateTypesStream ({store}) {
  return (call) => {
    let { aggregateTypes } = call.request
    if (!every(aggregateTypes, isValidString)) return call.emit('error', new TypeError('aggregateTypes should be a list of non empty strings'))

    let subscription = store.eventsStream
                        .filter(({aggregateIdentity}) => !!~aggregateTypes.indexOf(aggregateIdentity.type))
                        .subscribe(evt => call.write(evt))

    call.on('end', () => {
      subscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToAggregateTypesStream
