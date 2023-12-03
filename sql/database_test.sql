-- Test returning all data from useraccount table
SELECT
    *
FROM
    useraccount;

-- Test returning specific user account data
SELECT
    *
FROM
    useraccount
WHERE
    id = 1;

-- Test inserting into useraccount table
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
        'Jane',
        'Doe',
        'jane.doe@calvin.edu',
        'password',
        'token',
        '{"reading", "coding"}',
        '{"pizza", "cycling"}',
        'Spain'
    );

-- Test returning Jane Doe's data
SELECT
    *
FROM
    useraccount
WHERE
    id = 2;

-- Test deleting Jane Doe's data
DELETE FROM
    useraccount
WHERE
    id = 2;

-- Test returning all data from phrases table
SELECT
    *
FROM
    phrases;

-- Test returning specific phrase data
SELECT
    *
FROM
    phrases
WHERE
    id = 1
    AND userid = 1;
