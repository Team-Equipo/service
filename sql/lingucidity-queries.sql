-- lingucidity-queries.sql

-- Get the users
SELECT *
	FROM user_account
  ;

-- Get the travel plan
SELECT * 
  FROM travel_plan
  ;

-- Get the generated phrases 
SELECT * 
  FROM generated_phrases
  ;

-- Get English speaking users 
SELECT * 
  FROM user_account
	WHERE first_language IS "English"
  ;

-- Get Hispanohablantes (Spanish Speakers)
SELECT * 
  FROM user_account
	WHERE first_language IS "Spanish"
  ;

-- Get the saved generated phrases 
SELECT * 
  FROM generated_phrases
	WHERE is_saved IS true
  ;
