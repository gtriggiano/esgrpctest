import { isValidString } from '../../utils'

function SubscribeToAggregateStream ({store}) {
  return (call) => {
    let { id, type } = call.request

    // Validate request
    if (!isValidString(id)) return call.emit('error', new TypeError('id should be a non empty string'))
    if (!isValidString(type)) return call.emit('error', new TypeError('type should be a non empty string'))

    let subscription = store.eventsStream
      .filter(({aggregateIdentity}) => aggregateIdentity.id === id && aggregateIdentity.type === type)
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

export default SubscribeToAggregateStream
