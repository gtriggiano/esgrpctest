import Promise from 'bluebird'

export default function createAggregate (client, aggregateIdentity) {
  return new Promise((resolve, reject) => {
    let { uuid, type } = aggregateIdentity
    client.query(
      `INSERT INTO aggregates (uuid, type, version)
      VALUES ($1, $2, $3)`,
      [uuid, type, -1],
      (err) => {
        if (err) return reject(err)
        resolve({
          uuid,
          type,
          version: -1
        })
      }
    )
  })
}
