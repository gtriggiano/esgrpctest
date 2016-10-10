import shortid from 'shortid'

function GetUid () {
  return (_, callback) => callback(null, {uid: shortid()})
}

export default GetUid
