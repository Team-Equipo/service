require("dotenv").config();

const pgp = require("pg-promise")();
const db = pgp({
  host: process.env.DB_TEST_SERVER,
  port: process.env.DB_PORT,
  database: process.env.DB_TEST_USER,
  user: process.env.DB_TEST_USER,
  password: process.env.DB_TEST_PASSWORD,
  // host: process.env.DB_SERVER,
  // port: process.env.DB_PORT,
  // database: process.env.DB_USER,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,

  ssl: true,
});

// Send the SQL command directly to Postgres.
db.many("SELECT * FROM user_account")
  .then(function (data) {
    console.log(data);
  })
  .catch(function (error) {
    console.log("ERROR:", error);
  });

