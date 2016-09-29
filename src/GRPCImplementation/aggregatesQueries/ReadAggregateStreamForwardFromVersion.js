import { isValidString } from '../../utils'

function ReadAggregateStreamForwardFromVersion ({backend}) {
  return (call) => {
    let { aggregateIdentity, fromVersion, limit } = call.request

    // Validate aggregateIdentity
    if (!aggregateIdentity) return call.emit('error', new TypeError('aggregateIdentity cannot be undefined'))
    if (!isValidString(aggregateIdentity.uuid)) return call.emit('error', new TypeError('aggregateIdentity.uuid should be a non empty string'))
    if (!isValidString(aggregateIdentity.type)) return call.emit('error', new TypeError('aggregateIdentity.type should be a non empty string'))

    fromVersion = fromVersion >= 0 ? fromVersion : 0

    let params = {aggregateIdentity, fromVersion}
    if (limit > 0) params.limit = limit

    let backendQuery = backend.getAggregateEvents(params)
    backendQuery.on('event', evt => call.write(evt))
    backendQuery.on('end', () => call.end())
  }
}

export default ReadAggregateStreamForwardFromVersion
