# Lingucidity WebService

This is the data service application for
[Lingucidity](https://github.com/Team-Equipo/project),
which is deployed here:

- <https://lingucidity.azurewebsites.net/>

It has the following read data route URLs:

- `/` a hola message
- `/user` a list of players
- `/user/:user_id` a single user with the given ID
- `/user/:user_id/plan` a list of plans of a user with the given ID
- `/user/:user_id/plan/:plan_id` a plan with given ID of a user with the given ID
- `/user/:user_id/phrase` a list of phrases of a user with the given ID
- `/user/:user_id/phrase/:phrase_id` a phrase with given ID of a user with the given ID

The database is relational with the schema specified in the sql/ sub-directory and is hosted on [ElephantSQL](https://www.elephantsql.com/). 

[Lingucidity Client](https://github.com/Team-Equipo/client)\
[Lingucidity Project](https://github.com/Team-Equipo/project)
