import { isValidString } from '../utils'

function SubscribeToAggregateStream ({store}) {
  return (call) => {
    let { uuid, type } = call.request
    if (!isValidString(uuid)) return call.emit('error', new TypeError('AggregateIdentity.uuid should be a non empty string'))
    if (!isValidString(type)) return call.emit('error', new TypeError('AggregateIdentity.type should be a non empty string'))

    let subscription = store.eventsStream
                        .filter(({aggregateIdentity}) => aggregateIdentity.uuid === uuid && aggregateIdentity.type === type)
                        .subscribe(evt => call.write(evt))

    call.on('end', () => {
      subscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToAggregateStream
