-- Set up our database
CREATE TABLE users (
    user_id TEXT PRIMARY KEY NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE diagnoses (
    diagnosis_id TEXT PRIMARY KEY NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    diagnosed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image BLOB
);

CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
);