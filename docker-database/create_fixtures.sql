CREATE DATABASE reperio_platform_dev;
CREATE DATABASE reperio_platform_test;

CREATE USER reperio WITH PASSWORD 'reperio';
ALTER USER reperio WITH SUPERUSER;

GRANT ALL PRIVILEGES ON DATABASE reperio_platform_dev to reperio;
GRANT ALL PRIVILEGES ON DATABASE reperio_platform_test to reperio;

