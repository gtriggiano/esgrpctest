function transactionReleaseSavepoint (client, done) {
  client.query('RELEASE SAVEPOINT cockroach_restart', (err) => done(err))
}

export default transactionReleaseSavepoint
