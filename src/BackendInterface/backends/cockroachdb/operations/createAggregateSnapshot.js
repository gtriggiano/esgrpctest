import Promise from 'bluebird'

export default function createAggregateSnapshot (client, aggregateIdentity, version, data) {
  return new Promise((resolve, reject) => {
    let {uuid, type} = aggregateIdentity
    let insertQueryString = `
      INSERT INTO snapshots
        (
          aggregateUuid,
          aggregateType,
          version,
          data
        )
      VALUES ($1, $2, $3, $4)`

    client.query(
      insertQueryString,
      [uuid, type, version, data],
      (err) => {
        if (err) return reject(err)
        resolve()
      }
    )
  })
}
