import { isValidString } from '../../utils'

function GetLastAggregateSnapshot ({backend}) {
  return (call, callback) => {
    let { id, type } = call.request
    if (!isValidString(id)) return callback(new TypeError('AggregateIdentity.id should be a non empty string'))
    if (!isValidString(type)) return callback(new TypeError('AggregateIdentity.type should be a non empty string'))

    let replied = false
    let reply = (snapshot) => {
      if (replied) return
      replied = true
      if (snapshot) return callback(null, {snapshot})
      callback(null, {notFound: {}})
    }

    let params = {aggregateIdentity: call.request}
    let backendResults = backend.getLastSnapshotOfAggregate(params)
    backendResults.on('snapshot', reply)
    backendResults.on('end', reply)
  }
}

export default GetLastAggregateSnapshot
