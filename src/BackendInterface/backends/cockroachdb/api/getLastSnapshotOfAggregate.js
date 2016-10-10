import EventEmitter from 'eventemitter3'

function getLastSnapshotOfAggregateFactory (getConnection) {
  return ({aggregateIdentity}) => {
    let results = new EventEmitter()

    let queryString = `SELECT * FROM snapshots
                    WHERE aggregateId = $1
                      AND aggregateType = $2
                    ORDER BY version DESC
                    LIMIT 1`
    let queryParams = [
      aggregateIdentity.id,
      aggregateIdentity.type
    ]

    getConnection((err, {client, release}) => {
      if (err) return results.emit('error', err)

      let query = client.query(queryString, queryParams)

      query.on('row', row => results.emit('snapshot', row))
      query.on('error', err => {
        results.emit('error', err)
        query.removeAllListeners()
        release()
      })
      query.on('end', () => {
        results.emit('end')
        query.removeAllListeners()
        release()
      })
    })

    return results
  }
}

export default getLastSnapshotOfAggregateFactory
