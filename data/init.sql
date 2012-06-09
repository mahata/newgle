DROP TABLE IF EXISTS member;
DROP TABLE IF EXISTS conf;
DROP FUNCTION IF EXISTS set_config (char, search_engine);
DROP FUNCTION IF EXISTS set_config (char, search_engine, boolean);
DROP FUNCTION IF EXISTS set_config (_name varchar(255), _search_engine SEARCH_ENGINE, _display_thumbnail BOOLEAN) ;
DROP TYPE IF EXISTS SEARCH_ENGINE;

CREATE TABLE member (
  id SERIAL,
  name VARCHAR(255),
  pass VARCHAR(40),
  created_at INTEGER,
  UNIQUE(name),
  UNIQUE(created_at)
);

CREATE TYPE SEARCH_ENGINE AS ENUM ('bing', 'yahoo');

CREATE TABLE conf (
  id SERIAL,
  member_id INTEGER,
  search_engine SEARCH_ENGINE DEFAULT 'bing',
  modified_at INTEGER,
  UNIQUE(member_id)
);
ALTER TABLE conf ADD COLUMN display_thumbnail BOOLEAN DEFAULT TRUE;

CREATE FUNCTION set_config (char, search_engine, boolean) RETURNS void AS '
  DECLARE
    _member_id INTEGER;
  BEGIN
    SELECT INTO _member_id id FROM conf WHERE member_id = (SELECT id FROM member WHERE name = $1);
    IF 0 < _member_id THEN
      UPDATE conf SET search_engine = $2, display_thumbnail = $3 WHERE member_id = _member_id;
      RETURN;
    ELSE
      INSERT INTO conf (member_id, search_engine, display_thumbnail) SELECT id, $2, $3 FROM member WHERE name = $1;
      RETURN;
    END IF;
  END
' LANGUAGE 'plpgsql';


