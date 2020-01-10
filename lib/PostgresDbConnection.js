const url = require('url');
const pgp = require('pg-promise')({
  // global db error handler
  error(err, e) {
    console.log(`Postgres Error:
    Query: "${e && e.query ? e.query.replace('\n', '') : ''}"
    Error: "${err ? err.message : ''}"`);
  }
});

const dbUrl = url.parse(process.env.DATABASE_URL);
const [user, password] = dbUrl.auth.split(':');
const [host, port] = dbUrl.host.split(':')

const PostgresDb = pgp({
  host,
  port,
  database: dbUrl.path.replace('/', ''),
  user,
  password
});

module.exports = PostgresDb;
