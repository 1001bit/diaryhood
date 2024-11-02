CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    -- DEFAULT RANDOM NAME LIKE user_randomString1234
    name VARCHAR(31) UNIQUE NOT NULL DEFAULT concat('user_', substring(md5(random()::text), 1, 31-5-10)),
    email VARCHAR(255) UNIQUE NOT NULL,
    date DATE DEFAULT now() NOT NULL
);