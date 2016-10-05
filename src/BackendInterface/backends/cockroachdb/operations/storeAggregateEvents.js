import Promise from 'bluebird'
import { range, flatten } from 'lodash'

import toDTO from '../helpers/eventRecordToDTO'

export default function storeAggregateEvents (client, aggregate, events, transactionId) {
  return new Promise((resolve, reject) => {
    let parametersList = events.map(({type, data, metadata}, idx) => ([
      type,
      aggregate.uuid,
      aggregate.type,
      aggregate.version + idx + 1,
      new Buffer(data, 'utf8'),
      new Buffer(metadata, 'utf8'),
      transactionId
    ]))

    let queryPlaceholders = parametersList.map(
      (parameters, idx) => {
        let placeholders = range(1, parameters.length + 1)
                            .map(n => n + (idx * parameters.length))
                            .map(n => `$${n}`)
        return `(${placeholders.join(', ')})`
      }
    )

    let insertQueryString = `
      INSERT INTO events
        (
          type,
          aggregateUuid,
          aggregateType,
          sequenceNumber,
          data,
          metadata,
          transactionId
        )
      VALUES ${queryPlaceholders.join(', ')}`

    let fetchQueryString = `
      SELECT * FROM events
      WHERE transactionId = $1
      ORDER BY id`

    // Write events
    client.query(
      insertQueryString,
      flatten(parametersList),
      (err) => {
        if (err) return reject(err)

        // Fetch and return stored events
        client.query(
          fetchQueryString,
          [transactionId],
          (err, result) => {
            if (err) return reject(err)
            resolve(result.rows.map(toDTO))
          }
        )
      }
    )
  })
}
