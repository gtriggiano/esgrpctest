import transactionBegin from '../operations/transactionBegin'
import transactionCommit from '../operations/transactionCommit'
import transactionReleaseSavepoint from '../operations/transactionReleaseSavepoint'
import transactionRollback from '../operations/transactionRollback'
import transactionRollbackToSavepoint from '../operations/transactionRollbackToSavepoint'

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
