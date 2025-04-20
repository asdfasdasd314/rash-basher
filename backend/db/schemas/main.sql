-- Set up our database
CREATE TABLE users (
    user_id TEXT PRIMARY KEY NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    store_classifications BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE classifications (
    classification_id TEXT PRIMARY KEY NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    classification TEXT NOT NULL,
    classified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    --Image attributes
    filename TEXT,
    data BLOB,
    content_type TEXT
);

CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE salts (
    salt TEXT PRIMARY KEY NOT NULL UNIQUE
);