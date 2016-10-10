import EventEmitter from 'eventemitter3'

import toDTO from '../helpers/eventRecordToDTO'

function getEventsByTypesFactory (getConnection) {
  return ({eventTypes, fromEventId, limit}) => {
    let typesPlaceholders = eventTypes.map((_, i) => `$${i + 2}`).join(', ')

    let queryStr = `SELECT * FROM events
                    WHERE id > $1
                      AND type IN (${typesPlaceholders})
                    ORDER BY id `
    let queryParams = [
      fromEventId,
      ...eventTypes
    ]

    if (limit) {
      queryStr += `LIMIT $${eventTypes.length + 2}`
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

export default getEventsByTypesFactory
