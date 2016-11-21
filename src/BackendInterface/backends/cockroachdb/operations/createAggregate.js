import Promise from 'bluebird'

export default function createAggregate (client, aggregateIdentity) {
  return new Promise((resolve, reject) => {
    let { id, type } = aggregateIdentity
    client.query(
      `INSERT INTO aggregates (id, type, version)
      VALUES ($1, $2, $3)`,
      [id, type, 0],
      (err) => {
        if (err) return reject(err)
        resolve({
          id,
          type,
          version: 0
        })
      }
    )
  })
}
