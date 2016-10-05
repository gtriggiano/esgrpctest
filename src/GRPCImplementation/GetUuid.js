import shortid from 'shortid'

function GetUuid () {
  return (_, callback) => callback(null, shortid())
}

export default GetUuid
