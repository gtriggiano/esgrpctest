import Promise from 'bluebird'

export default function createAggregateSnapshot (client, aggregateIdentity, version, data) {
  return new Promise((resolve, reject) => {
    let {id, type} = aggregateIdentity
    let insertQueryString = `
      INSERT INTO snapshots
        (
          aggregateId,
          aggregateType,
          version,
          data
        )
      VALUES ($1, $2, $3, $4)`

    client.query(
      insertQueryString,
      [id, type, version, data],
      (err) => {
        if (err) return reject(err)
        resolve()
      }
    )
  })
}
