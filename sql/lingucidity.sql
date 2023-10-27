-- lingucidity.sql

-- Drop previous versions of the tables if they they exist,
-- in reverse order of foreign keys.
DROP TABLE IF EXISTS travel_plan;
DROP TABLE IF EXISTS user_account;
DROP TABLE IF EXISTS generated_phrases;

-- Create the schema
-- For date: use ISO 8601 (yyyy-mm-dd)
CREATE TABLE user_account (
	user_account_id integer PRIMARY KEY,
	username varchar(20) NOT NULL,
	password varchar(30) NOT NULL,
	name varchar(40) NOT NULL,
	date_of_birth date,
	first_language varchar(50),
	education_level varchar(30),
	hobby text[],
	favorite_food text[]
	);

CREATE TABLE travel_plan (
	travel_plan_id integer PRIMARY KEY, 
	destination_country text,
	travel_date date,
	travel_plan text[],
	userID integer REFERENCES user_account(user_account_id)
	);

CREATE TABLE generated_phrases (
	generated_phrases_id integer PRIMARY KEY,
	text_original text,
	text_translated text,
	topic text,
	is_saved boolean,
	userID integer REFERENCES user_account(user_account_id)
	);

-- Allow users to select data from the tables.
-- GRANT SELECT ON user_account TO PUBLIC;
-- GRANT SELECT ON travel_plan TO PUBLIC;
-- GRANT SELECT ON generated_phrases TO PUBLIC;


-- Create Test User, plan, and phrases
DELETE FROM user_account
  WHERE user_account_id = 1;

DELETE FROM travel_plan
  WHERE travel_plan_id = 1;

DELETE FROM generated_phrases
  WHERE generated_phrases_id = 1;

DELETE FROM generated_phrases
  WHERE generated_phrases_id = 2;

INSERT INTO user_account VALUES (1, 'testusername', 'testpassword', 'testuser', '2000-01-01', 'English', 'University', '{"music listening", "eating"}', '{"pizza", "pasta"}');

INSERT INTO travel_plan VALUES (1, 'Spain', '2023-11-01', '{"have dinner"}', 1);

INSERT INTO generated_phrases VALUES (1, 'Hello', 'Hola', 'General Greetings', true, 1);
INSERT INTO generated_phrases VALUES (2, 'Bye', 'Chao', 'General Greetings', false, 1);