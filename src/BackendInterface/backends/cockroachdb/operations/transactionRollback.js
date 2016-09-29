function transactionRollback (client, done) {
  client.query('ROLLBACK', (err) => done(err))
}

export default transactionRollback
