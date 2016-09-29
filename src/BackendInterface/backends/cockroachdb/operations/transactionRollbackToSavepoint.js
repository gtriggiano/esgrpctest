function transactionRollbackToSavepoint (client, done) {
  client.query('ROLLBACK TO SAVEPOINT cockroach_restart', (err) => done(err))
}

export default transactionRollbackToSavepoint
