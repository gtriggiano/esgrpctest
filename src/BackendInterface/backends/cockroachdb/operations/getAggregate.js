import Promise from 'bluebird'

export default function getAggregate (client, aggregateIdentity) {
  return new Promise((resolve, reject) => {
    let { uuid, type } = aggregateIdentity
    client.query(
      `SELECT * FROM aggregates
       WHERE uuid = $1 AND type = $2`,
      [uuid, type],
      (err, result) => {
        if (err) return reject(err)
        resolve(result.rows[0])
      }
    )
  })
}
