-- The same CREATE TABLE commands were used to create the tables in ElephantSQL
-- Use this file to test the database in local PostgreSQL environment

-- Drop previous tables if they exist
DROP TABLE IF EXISTS useraccount;
DROP TABLE IF EXISTS phrases;

-- User account schema
CREATE TABLE useraccount (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(512) NOT NULL,
    lastname VARCHAR(512) NOT NULL,
    emailaddress VARCHAR(512) NOT NULL,
    password VARCHAR(512) NOT NULL,
    token VARCHAR(512) NOT NULL,
    hobby TEXT [],
    favoritefood TEXT [],
    destination VARCHAR(512) NOT NULL,
);

-- Phrases schema
CREATE TABLE phrases (
    id SERIAL PRIMARY KEY,
    originaltext VARCHAR(512) NOT NULL,
    translatedtext VARCHAR(512) NOT NULL,
    topic VARCHAR(512) NOT NULL,
    issaved BOOLEAN NOT NULL,
    userid INTEGER REFERENCES useraccount(id)
);

-- Test user account
INSERT INTO
    useraccount (
        firstname,
        lastname,
        emailaddress,
        password,
        token,
        hobby,
        favoritefood,
        destination
    )
VALUES
    (
        'testfirstname',
        'testlastname',
        'testemailaddress',
        'testpassword',
        'testtoken',
        '{"music listening", "eating"}',
        '{"pizza", "pasta"}',
        'testdestination'
    );

-- Test phrases
INSERT INTO
    phrases (
        originaltext,
        translatedtext,
        topic,
        issaved,
        userid
    )
VALUES
    (
        'testoriginaltext',
        'testtranslatedtext',
        'testtopic',
        'testissaved',
        1
    );
