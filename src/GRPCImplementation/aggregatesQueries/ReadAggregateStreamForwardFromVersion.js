import { isValidString, eventsStreamFromBackendEmitter } from '../../utils'

function ReadAggregateStreamForwardFromVersion ({backend}) {
  return (call) => {
    let { aggregateIdentity, fromVersion, limit } = call.request

    // Validate request
    if (!aggregateIdentity) return call.emit('error', new TypeError('aggregateIdentity cannot be undefined'))
    if (!isValidString(aggregateIdentity.id)) return call.emit('error', new TypeError('aggregateIdentity.id should be a non empty string'))
    if (!isValidString(aggregateIdentity.type)) return call.emit('error', new TypeError('aggregateIdentity.type should be a non empty string'))

    fromVersion = fromVersion >= -1 ? fromVersion : -1

    let params = {aggregateIdentity, fromVersion}
    if (limit > 0) params.limit = limit

    let backendResults = backend.getEventsByAggregate(params)
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

export default ReadAggregateStreamForwardFromVersion
