const delay = require('delay');
const {knex} = require('./connect');

async function initializeDatabase() {
    let attemptMigrations = true;
    while (attemptMigrations) {
        try {
            console.log('attempting to run db migrations and seeds');
            await knex.migrate.latest();
            await knex.seed.run();
            console.log('db migrations and seeds ran successfully');
            attemptMigrations = false;
        } catch (e) {
            console.log('unable to run migrations and seeds, will retry');
            await delay(2000);
        }
    }
}

initializeDatabase()
    .then(() => process.exit(0), () => process.exit(-1));