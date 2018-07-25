
const {knex, Model} = require('./connect');
const repositories = require('./repositories');

const models = require('./models');

class UnitOfWork {
    constructor(logger) {
        this._knex = knex;
        this._Model = Model;
        this._models = models;
        this._transaction = null;
        this._logger = logger;

        this._cachedRepositories = {};

        for (const [repositoryName, Repository] of Object.entries(repositories)) {
            Object.defineProperty(this, repositoryName, {
                get: () => {
                    this._cachedRepositories[repositoryName] = this._cachedRepositories[repositoryName] || new Repository(this);
                    return this._cachedRepositories[repositoryName];
                }
            });
        }
    }

    async beginTransaction() {
        if (this._transaction !== null) {
            throw new Error("A transaction already exists for this unit of work");
        }

        this._transaction = await transaction.start(knex);
    }

    async commitTransaction() {
        if (this._transaction === null) {
            throw new Error("A transaction does not exist for this unit of work");
        }
        await this._transaction.commit();
        this._transaction = null;
    }

    async rollbackTransaction() {
        if (this._transaction === null) {
            throw new Error("A transaction does not exist for this unit of work");
        }
        await this._transaction.rollback();
        this._transaction = null;
    }

    get inTransaction() {
        return this._transaction !== null;
    }
}

module.exports = UnitOfWork;
