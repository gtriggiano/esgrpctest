function transactionBegin (client, done) {
  client.query('BEGIN; SAVEPOINT cockroach_restart', (err) => done(err))
}
function transactionCommit (client, done) {
  client.query('COMMIT', (err) => done(err))
}
function transactionRollback (client, done) {
  client.query('ROLLBACK', (err) => done(err))
}
function transactionReleaseSavepoint (client, done) {
  client.query('RELEASE SAVEPOINT cockroach_restart', (err) => done(err))
}
function transactionRollbackToSavepoint (client, done) {
  client.query('ROLLBACK TO SAVEPOINT cockroach_restart', (err) => done(err))
}

function handleOperationError (client, err, cb) {
  if (err.code === '40001') {
    transactionRollbackToSavepoint(client, cb)
  } else {
    cb(err)
  }
}

function transactionWrapper (client, operation, done) {
  transactionBegin(client, (err) => {
    if (err) return done(err)

    let releasedTransaction = false

    _attempt(_finalize)

    function _attempt (finalize) {
      operation(client, (err, results) => {
        if (err) return handleOperationError(client, err, finalize)

        transactionReleaseSavepoint(client, (err) => {
          if (err) return handleOperationError(client, err, finalize)

          releasedTransaction = true
          finalize(null, results)
        })
      })
    }

    function _finalize (err, results) {
      if (err) {
        transactionRollback(client, () => done(err))
      } else if (!releasedTransaction) {
        _attempt(_finalize)
      } else {
        transactionCommit(client, (err) => {
          if (err) return done(err)
          done(null, results)
        })
      }
    }
  })
}

export default transactionWrapper
