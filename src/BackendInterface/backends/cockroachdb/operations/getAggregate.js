import Promise from 'bluebird'

export default function getAggregate (client, aggregateIdentity) {
  return new Promise((resolve, reject) => {
    let { id, type } = aggregateIdentity
    client.query(
      `SELECT * FROM aggregates
       WHERE id = $1 AND type = $2`,
      [id, type],
      (err, result) => {
        if (err) return reject(err)
        resolve(result.rows[0])
      }
    )
  })
}
