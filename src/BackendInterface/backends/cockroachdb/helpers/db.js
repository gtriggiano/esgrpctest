import pg from 'pg'

let _connectionsPool
function setupConnectionsPool (poolConfig) {
  if (_connectionsPool) return
  _connectionsPool = new pg.Pool(poolConfig)
}

function getConnection (callback) {
  if (!_connectionsPool) throw new Error('A connection pool is not defined.')
  _connectionsPool.connect((err, client, release) => {
    if (err) return callback(err)
    callback(null, {client, release})
  })
}

export {
  setupConnectionsPool,
  getConnection
}
