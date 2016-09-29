function transactionCommit (client, done) {
  client.query('COMMIT', (err) => done(err))
}

export default transactionCommit
