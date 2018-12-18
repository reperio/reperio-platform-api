CREATE DATABASE reperio_platform_dev;

CREATE USER reperio WITH PASSWORD 'reperio';
ALTER USER reperio WITH SUPERUSER;

GRANT ALL PRIVILEGES ON DATABASE reperio_platform_dev to reperio;
