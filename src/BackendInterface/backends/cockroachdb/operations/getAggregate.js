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
        if (!result.rows[0]) return resolve()
        let {id, type, version} = result.rows[0]
        resolve({
          id,
          type,
          version: parseInt(version, 10)
        })
      }
    )
  })
}
