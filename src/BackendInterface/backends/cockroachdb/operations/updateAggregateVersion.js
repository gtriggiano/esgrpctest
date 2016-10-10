import Promise from 'bluebird'

export default function updateAggregateVersion (client, aggregateIdentity, version) {
  return new Promise((resolve, reject) => {
    let { id, type } = aggregateIdentity
    client.query(
      `UPDATE aggregates
      SET version = $3
      WHERE id = $1
        AND type = $2`,
      [id, type, version],
      (err) => {
        if (err) return reject(err)
        resolve({
          id,
          type,
          version
        })
      }
    )
  })
}
