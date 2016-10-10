import pg from 'pg'

function setupConnectionsPool (poolConfig) {
  let _connectionsPool = new pg.Pool(poolConfig)

  return function getConnection (callback) {
    _connectionsPool.connect((err, client, release) => {
      if (err) return callback(err)
      callback(null, {client, release})
    })
  }
}

export default setupConnectionsPool
