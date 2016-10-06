import EventEmitter from 'eventemitter3'

import toDTO from '../helpers/eventRecordToDTO'

function getEventsByAggregateFactory (getConnection) {
  return ({aggregateIdentity, fromVersion, limit}) => {
    let queryStr = `SELECT * FROM events
                    WHERE aggregateId = $1
                      AND aggregateType = $2
                      AND sequenceNumber > $3
                    ORDER BY id `
    let queryParams = [
      aggregateIdentity.id,
      aggregateIdentity.type,
      fromVersion
    ]

    if (limit) {
      queryStr += 'LIMIT $4'
      queryParams.push(limit)
    }

    let results = new EventEmitter()

    getConnection((err, {client, release}) => {
      if (err) return results.emit('error', err)

      let query = client.query(queryStr, queryParams)

      query.on('row', row => results.emit('event', toDTO(row)))
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

export default getEventsByAggregateFactory
