const pgp = require("pg-promise")();

const db = pgp({
  host: process.env.DB_SERVER,
  port: process.env.DB_PORT,
  database: process.env.DB_USER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const Hapi = require("@hapi/hapi");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.SERVER || "localhost",
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hola, mundo!";
    },
  });

  server.route({
    method: "POST",
    path: "/user",
    handler: (request, h) => {
      const firstname = request.payload.firstname;
      const lastname = request.payload.lastname;
      const emailaddress = request.payload.emailaddress;
      const password = request.payload.password;

      db.none(
        "INSERT INTO useraccount (firstname, lastname, emailaddress, password) VALUES ($1, $2, $3, $4)",
        [
          request.payload.firstname,
          request.payload.lastname,
          request.payload.emailaddress,
          request.payload.password,
        ]
      );

      return "Success";
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();

// const express = require("express");

// const app = express();
// const port = process.env.PORT || 3000;
// const router = express.Router();
// router.use(express.json());

// // Default route
// router.get("/", readHelloMessage);
// // Handle user data
// router.get("/user", readUsers);
// router.get("/user/:user_id", readUser);
// router.put("/user/:user_id", updateUser);
// router.post("/user", createUser);
// router.delete("/user/:user_id", deleteUser);

// // Handle travel plan data
// router.get("/user/:user_id/plan", readPlans);
// router.get("/user/:user_id/plan/:plan_id", readPlan);
// router.put("/user/:user_id/plan/:plan_id", updatePlan);
// router.post("/user/:user_id/plan", createPlan);
// router.delete("/user/:user_id/plan/:plan_id", deletePlan);

// // Handle phrases data
// router.get("/user/:user_id/phrase", readPhrases);
// router.get("/user/:user_id/phrase/:phrase_id", readPhrase);
// router.put("/user/:user_id/phrase/:phrase_id", savePhrase);
// router.post("/user/:user_id/phrase", createPhrase);
// router.delete("/user/:user_id/phrase/:phrase_id", deletePhrase);

// app.use(router);
// app.listen(port, () => console.log(`Listening on port ${port}`));

// function returnDataOr404(res, data) {
//   if (data == null) {
//     res.sendStatus(404);
//   } else {
//     res.send(data);
//   }
// }

// // =========== Hello Message =========== //
// function readHelloMessage(req, res) {
//   res.send("Hola, servicio CS262 Lingucididad!");
// }

// // =========== Handle User Data =========== //
// function readUsers(req, res, next) {
//   db.many("SELECT * FROM user_account")
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function readUser(req, res, next) {
//   db.oneOrNone(
//     "SELECT * FROM user_account WHERE user_account_id=${user_id}",
//     req.params
//   )
//     .then((data) => {
//       returnDataOr404(res, data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function updateUser(req, res, next) {
//   db.oneOrNone(
//     "UPDATE user_account SET username=${body.username}, name=${body.name}, date_of_birth=${body.date_of_birth}, first_language=${body.first_language}, education_level=${body.education_level}, hobby=${body.hobby}, favorite_food=${body.favorite_food} WHERE user_account_id=${params.user_id} RETURNING user_account_id",
//     req
//   )
//     .then((data) => {
//       returnDataOr404(res, data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function createUser(req, res, next) {
//   db.one(
//     "INSERT INTO user_account(username, password, name, date_of_birth, first_language, education_level, hobby, favorite_food) VALUES (${username}, ${password}, ${name}, ${date_of_birth}, ${first_language}, ${education_level}, ${hobby}, ${favorite_food}) RETURNING user_account_id",
//     req.body
//   )
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function deleteUser(req, res, next) {
//   db.oneOrNone(
//     "DELETE FROM user_account WHERE user_account_id=${user_id} RETURNING user_account_id",
//     req.params
//   )
//     .then((data) => {
//       returnDataOr404(res, data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// // =========== Handle Travel Plan (of a specific user) Data =========== //
// function readPlans(req, res, next) {
//   db.many("SELECT * FROM travel_plan WHERE userID = ${user_id}", req.params)
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function readPlan(req, res, next) {
//   db.oneOrNone(
//     "SELECT * FROM travel_plan WHERE userID = ${user_id} AND travel_plan_id = ${plan_id}",
//     req.params
//   )
//     .then((data) => {
//       returnDataOr404(res, data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function updatePlan(req, res, next) {
//   db.oneOrNone(
//     "UPDATE travel_plan SET destination_country=${body.destination_country}, travel_date=${body.travel_date}, travel_plan=${body.travel_plan} WHERE travel_plan_id=${plan_id} RETURNING travel_plan_id",
//     {
//       body: req.body, // Use req.body to access the update values
//       plan_id: req.params.plan_id, // Use req.params to access the plan ID
//     }
//   )
//     .then((data) => {
//       returnDataOr404(res, data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function createPlan(req, res, next) {
//   db.one(
//     "INSERT INTO travel_plan(destination_country, travel_date, travel_plan, userID) VALUES (${destination_country}, ${travel_date}, ${travel_plan}, ${userID}) RETURNING travel_plan_id",
//     req.body // Use req.body to access the values to be inserted
//   )
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function deletePlan(req, res, next) {
//   db.oneOrNone(
//     "DELETE FROM travel_plan WHERE travel_plan_id=${plan_id} RETURNING travel_plan_id",
//     req.params
//   )
//     .then((data) => {
//       if (data) {
//         // Row was deleted, return a success message or status
//         res.status(204).send("Travel plan deleted successfully");
//       } else {
//         // Row was not found, return a 404 error
//         res.status(404).send("Travel plan not found");
//       }
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// // =========== Handle Phrase (of a specific user) Data =========== //
// function readPhrases(req, res, next) {
//   db.many(
//     "SELECT * FROM generated_phrases WHERE userID = ${user_id}",
//     req.params
//   )
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function readPhrase(req, res, next) {
//   db.oneOrNone(
//     "SELECT * FROM generated_phrases WHERE userID = ${user_id} AND generated_phrases_id = ${phrase_id}",
//     req.params
//   )
//     .then((data) => {
//       returnDataOr404(res, data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function savePhrase(req, res, next) {
//   db.oneOrNone(
//     "UPDATE generated_phrases SET is_saved=true WHERE generated_phrases_id=${phrase_id} AND is_saved = false RETURNING generated_phrases_id",
//     req.params // Use req.params to access the 'id' parameter
//   )
//     .then((data) => {
//       returnDataOr404(res, data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function createPhrase(req, res, next) {
//   db.one(
//     "INSERT INTO generated_phrases(text_original, text_translated, topic, is_saved, userID) VALUES (${text_original}, ${text_translated}, ${topic}, ${is_saved}, ${userID}) RETURNING generated_phrases_id",
//     req.body // Assuming req.body contains the necessary properties
//   )
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// }

// function deletePhrase(req, res, next) {
//   db.oneOrNone(
//     "DELETE FROM generated_phrases WHERE generated_phrases_id=${phrase_id} RETURNING generated_phrases_id",
//     req.params
//   )
//     .then((data) => {
//       if (data) {
//         // Row was deleted, return a success message or status
//         res.status(204).send("Phrase deleted successfully");
//       } else {
//         // Row was not found, return a 404 error
//         res.status(404).send("Phrase not found");
//       }
//     })
//     .catch((err) => {
//       next(err);
//     });
// }
