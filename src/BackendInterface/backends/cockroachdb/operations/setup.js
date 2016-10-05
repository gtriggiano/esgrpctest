import fs from 'fs'
import Promise from 'bluebird'

let setupSQLFile = `${__dirname}/setup.sql`

function setupDatabase (client) {
  return new Promise((resolve, reject) => {
    fs.readFile(setupSQLFile, (err, setupQuery) => {
      if (err) return reject(err)
      client.query(setupQuery, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}

export default setupDatabase
