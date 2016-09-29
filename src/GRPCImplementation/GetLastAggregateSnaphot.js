import { isValidString } from '../utils'

function GetLastAggregateSnaphot ({backend}) {
  return (call, callback) => {
    let { uuid, type } = call.request
    if (!isValidString(uuid)) return callback(new TypeError('AggregateIdentity.uuid should be a non empty string'))
    if (!isValidString(type)) return callback(new TypeError('AggregateIdentity.type should be a non empty string'))
  }
}

export default GetLastAggregateSnaphot
