class SharedDatabase {
    static setUpTest(knex, knexConfig) {
        return new Promise(async resolve => {
            await knex.migrate.rollback(knexConfig);
            await knex.migrate.latest(knexConfig);
            await knex.seed.run(knexConfig);
            resolve();
        });
    }

    static tearDownTest(knex, knexConfig) {
        return new Promise(async resolve => {
            await knex.migrate.rollback(knexConfig);
            await knex.destroy();
            resolve();
        });
    }
}

module.exports = SharedDatabase;