
const {knex, Model} = require('./connect');
const repositories = require('./repositories');

const models = require('./models');

class UnitOfWork {
    constructor(logger) {
        this._knex = knex;
        this._Model = Model;
        this._models = models;
        this._transaction = null;

        knex.on('query', (query) => logger.debug(query.toNative()));

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
            throw new Error('Cannot begin transaction, a transaction already exists for this unit of work');
        }
        
        //TODO does this even work?!? It never resolves.....
        await new Promise(resolve => {
            knex.transaction(trx => {
                this._transaction = trx;
            });
        });
    }

    async commitTransaction() {
        if (this._transaction === null) {
            throw new Error('Cannot commit transaction, a transaction does not exist for this unit of work');
        }
        await this._transaction.commit();
        this._transaction = null;
    }

    async rollbackTransaction() {
        if (this._transaction === null) {
            throw new Error('Cannot rollback transaction, a transaction does not exist for this unit of work');
        }
        await this._transaction.rollback();
        this._transaction = null;
    }

    get inTransaction() {
        return this._transaction !== null;
    }
}

module.exports = UnitOfWork;
