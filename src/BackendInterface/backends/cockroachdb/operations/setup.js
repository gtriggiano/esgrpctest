import fs from 'fs'

let setupSQLFile = `${__dirname}/setup.sql`

function setupDatabase (client, done) {
  let setupQuery = fs.readFileSync(setupSQLFile)
  client.query(setupQuery, err => done(err))
}

export default setupDatabase
