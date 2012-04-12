DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id SERIAL,
  name VARCHAR(255),
  pass VARCHAR(255),
  created_date INTEGER,
  UNIQUE(name),
  UNIQUE(created_date)
);

