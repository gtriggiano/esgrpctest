function transactionBegin (client, done) {
  client.query('BEGIN; SAVEPOINT cockroach_restart', (err) => done(err))
}

export default transactionBegin
