import uuid from 'uuid'

function GetUuid () {
  return (_, callback) => callback(null, uuid.v4())
}

export default GetUuid
