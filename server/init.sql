DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id         SERIAL    PRIMARY KEY,
  username   TEXT      NOT NULL,
  email      TEXT      NOT NULL UNIQUE,
  password   TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
  balance DECIMAL(10,2) NOT NULL
);