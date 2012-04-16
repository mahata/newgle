DROP TABLE IF EXISTS member;
CREATE TABLE member (
  id SERIAL,
  name VARCHAR(255),
  pass VARCHAR(40),
  created_at INTEGER,
  UNIQUE(name),
  UNIQUE(created_at)
);

DROP TYPE IF EXISTS SEARCH_ENGINE;
CREATE TYPE SEARCH_ENGINE AS ENUM ('bing', 'yahoo');
-- ALTER TYPE SEARCH_ENGINE ADD VALUE 'google';

DROP TABLE IF EXISTS conf;
CREATE TABLE conf (
  id SERIAL,
  member_id INTEGER,
  search_engine SEARCH_ENGINE,
  modified_at INTEGER,
  UNIQUE(member_id)
);

DROP FUNCTION IF EXISTS set_config (char, search_engine);
CREATE FUNCTION set_config (char, search_engine) RETURNS void AS '
  DECLARE
    _member_id INTEGER;
  BEGIN
    SELECT INTO _member_id id FROM conf WHERE member_id = (SELECT id FROM member WHERE name = $1);
    IF 0 < _member_id THEN
      UPDATE conf SET search_engine = $2 WHERE member_id = _member_id;
      RETURN;
    ELSE
      INSERT INTO conf (member_id, search_engine) SELECT id, $2 FROM member WHERE name = $1;
      RETURN;
    END IF;
  END
' LANGUAGE 'plpgsql';
