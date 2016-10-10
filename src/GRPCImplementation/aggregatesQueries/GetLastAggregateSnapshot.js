import { isValidString } from '../../utils'

function GetLastAggregateSnapshot ({backend}) {
  return (call, callback) => {
    let { id, type } = call.request
    if (!isValidString(id)) return callback(new TypeError('AggregateIdentity.id should be a non empty string'))
    if (!isValidString(type)) return callback(new TypeError('AggregateIdentity.type should be a non empty string'))

    // TODO: implement GetLastAggregateSnaphot
  }
}

export default GetLastAggregateSnapshot
