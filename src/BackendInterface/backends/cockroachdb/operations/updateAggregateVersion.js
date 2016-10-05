import Promise from 'bluebird'

export default function updateAggregateVersion (client, aggregateIdentity, version) {
  return new Promise((resolve, reject) => {
    let { uuid, type } = aggregateIdentity
    client.query(
      `UPDATE aggregates
      SET version = $3
      WHERE uuid = $1
        AND type = $2`,
      [uuid, type, version],
      (err) => {
        if (err) return reject(err)
        resolve({
          uuid,
          type,
          version
        })
      }
    )
  })
}
