# wipe and rebuild docker containers from scratch
echo "rebuilding docker containers"
docker-compose down 
docker-compose build 
docker-compose up -d

# wait for postgres to start
echo "\nwaiting for postgres"
sleep 2 

# run migrations and seed data on dev database
echo "\nrunning migrations"
knex migrate:latest --knexfile db/knexfile.js 
echo "\nseeding data"
knex seed:run --knexfile db/knexfile.js