/**
 * This module implements a simple Hapi server for the Lingucidity app.
 * 
 * It connects to a PostgreSQL database (hosted on ElephantSQL) and provides a REST API for clients.
 * 
 * The server provides the following endpoints:
 * 
 * GET / - a simple hello world endpoint
 * GET /user - returns the user credentials if the user is authenticated
 * GET /user/{user_id}/phrase - returns a list of phrases for the user
 * GET /user/{user_id}/phrase/{phrase_id} - returns a specific phrase for the user
 * POST /user - creates a new user
 */

// Imports
const pgp = require("pg-promise")();
const Hapi = require("@hapi/hapi");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Configure the database connection
const db = pgp({
  host: process.env.DB_SERVER,
  port: process.env.DB_PORT,
  database: process.env.DB_USER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Very basic in-house validation of user credentials
const validate = async (request, emailaddress, password) => {
  const user = await db.oneOrNone(
    "SELECT firstname, lastname, password, token FROM useraccount WHERE emailaddress = $1",
    emailaddress
  );

  if (!user) {
    return { isValid: false, credentials: null };
  }

  const isValid = await bcrypt.compare(password, user.password);

  const credentials = {
    firstname: user.firstname,
    lastname: user.lastname,
    emailaddress: emailaddress,
    token: user.token,
  };

  return { isValid, credentials };
};

// Hapi server with endpoints
const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  await server.register(require("@hapi/basic"));
  server.auth.strategy("simple", "basic", { validate });

  // Hello world
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hola, servicio CS-262 Lingucididad!";
    },
  });

  // Authenticate a user and return credentials if valid
  server.route({
    method: "GET",
    path: "/user",
    config: {
      auth: "simple",
    },
    handler: async (request, h) => {
      return request.auth.credentials;
    },
  });

  // Get a list of phrases
  server.route({
    method: "GET",
    path: "/user/{user_id}/phrase",
    handler: async (request, h) => {
      const phrases = await db.any(
        "SELECT * FROM phrases WHERE userid = $1",
        request.params.user_id
      );
      return phrases;
    }
  });

  // Get a specific phrase
  server.route({
    method: "GET",
    path: "/user/{user_id}/phrase/{phrase_id}",
    handler: async (request, h) => {
      const phrases = await db.oneOrNone(
        "SELECT * FROM phrases WHERE userid = $1 AND id = $2",
        [request.params.user_id, request.params.phrase_id]
      );
      return phrases;
    }
  });

  // Create a new user
  server.route({
    method: "POST",
    path: "/user",
    handler: async (request, h) => {
      const emailaddress = request.payload.emailaddress;
      const hashedPassword = await bcrypt.hash(request.payload.password, 10);
      const token = await bcrypt.hash(emailaddress, 10);

      db.none(
        "INSERT INTO useraccount (firstname, lastname, emailaddress, password, token, hobby, favoritefood, destination) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          request.payload.firstname,
          request.payload.lastname,
          emailaddress,
          hashedPassword,
          token,
          request.payload.hobby,
          request.payload.favoritefood,
          request.payload.destination
        ]
      );

      return JSON.stringify(token);
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

// Start the server
init();
