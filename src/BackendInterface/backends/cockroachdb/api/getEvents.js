import EventEmitter from 'eventemitter3'

import toDTO from '../helpers/eventRecordToDTO'

function getEventsFactory (getConnection) {
  return ({fromEventId, limit}) => {
    let queryStr = `SELECT * FROM events
                    WHERE id > $1
                    ORDER BY id `

    let queryParams = [
      fromEventId
    ]

    if (limit) {
      queryStr += `LIMIT $2`
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

export default getEventsFactory
