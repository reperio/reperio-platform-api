const Model = require('objection').Model;
const Knex = require('knex');
const uuid = require('uuid/v4');

const defaultConfig = require('../../db/knexfile');
const UoW = require('../../db');
const sharedLogger = require('./sharedLogger');

class SharedDatabase {
    static createTestDatabase() {
        return new Promise(async resolve => {
            // get test database name and config
            const testConfig = JSON.parse(JSON.stringify(defaultConfig));
            const testDatabaseName = this.getRandomDatabaseName();
            testConfig.connection.database = testDatabaseName;

            // create test database
            const tmpKnex = Knex(defaultConfig);
            await tmpKnex.raw(`CREATE DATABASE ${testConfig.connection.database};`);
            await tmpKnex.destroy();

            // run migration and seed files on test db
            const testKnex = Knex(testConfig);
            await testKnex.migrate.latest(testConfig);
            await testKnex.seed.run(testConfig);

            // get UoW for test database
            Model.knex(testKnex);
            const testUoW = new UoW(sharedLogger);
            testUoW._knex.destroy();
            testUoW._knex = testKnex;
            testUoW._Model = Model;

            resolve({testUoW, testDatabaseName});
        });
    }

    static dropTestDatabase(testDatabaseName) {
        return new Promise(async resolve => {
            // rollback migrations on test datbase
            const testConfig = JSON.parse(JSON.stringify(defaultConfig));
            testConfig.connection.database = testDatabaseName;
            const testKnex = Knex(testConfig);
            await testKnex.migrate.rollback(testConfig);
            await testKnex.destroy();

            // drop test database
            const tmpKnex = Knex(defaultConfig);
            await tmpKnex.raw(`DROP DATABASE ${testDatabaseName};`);
            await tmpKnex.destroy();

            resolve();
        });
    }

    static getRandomDatabaseName() {
        const id = uuid()
        const stringId = id.toString().replace(/-/g, '');
        return `reperio_platform_test_${stringId}`;
    }
}

module.exports = SharedDatabase;
