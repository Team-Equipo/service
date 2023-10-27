require("dotenv").config();

const express = require("express");
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
});

const app = express();
const port = process.env.PORT || 3000;
const router = express.Router();
router.use(express.json());

router.get("/", readHelloMessage);
router.get("/user", readUsers);
router.get("/user/:id", readUser);
router.put("/user/:id", updateUser);
router.post("/user", createUser);
router.delete("/user/:id", deleteUser);

app.use(router);
app.listen(port, () => console.log(`Listening on port ${port}`));

function returnDataOr404(res, data) {
  if (data == null) {
    res.sendStatus(404);
  } else {
    res.send(data);
  }
}

function readHelloMessage(req, res) {
  res.send("Hola, servicio CS262 Lingucididad!");
}

function readUsers(req, res, next) {
  db.many("SELECT * FROM user_account")
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      next(err);
    });
}

function readUser(req, res, next) {
  db.oneOrNone("SELECT * FROM user_account WHERE id=${id}", req.params)
    .then((data) => {
      returnDataOr404(res, data);
    })
    .catch((err) => {
      next(err);
    });
}

function updateUser(req, res, next) {
  db.oneOrNone(
    "UPDATE user_account SET username=${body.username}, name=${body.name}, date_of_birth=${body.date_of_birth}, first_language=${body.first_language}, education_level=${body.education_level}, hobby=${body.hobby}, favorite_food=${body.favorite_food} WHERE id=${params.id} RETURNING id",
    req,
  )
    .then((data) => {
      returnDataOr404(res, data);
    })
    .catch((err) => {
      next(err);
    });
}

function createUser(req, res, next) {
  db.one(
    "INSERT INTO user_account(username, password, name, date_of_birth, first_language, education_level, hobby, favorite_food) VALUES (${username}, ${password}, ${name}, ${date_of_birth}, ${first_language}, ${education_level}, ${hobby}, ${favorite_food}) RETURNING id",
    req.body,
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      next(err);
    });
}

function deleteUser(req, res, next) {
  db.oneOrNone(
    "DELETE FROM user_account WHERE id=${id} RETURNING id",
    req.params,
  )
    .then((data) => {
      returnDataOr404(res, data);
    })
    .catch((err) => {
      next(err);
    });
}
