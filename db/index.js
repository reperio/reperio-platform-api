
const {knex, Model} = require('./connect');
const Repositories = require('./repositories');

const models = require('./models');

class UnitOfWork {
    constructor(logger) {
        this._knex = knex;
        this._Model = Model;
        this._models = models;
        this._transaction = null;

        knex.on('query', (query) => logger.debug(query.toNative()));

        this._logger = logger;

        this._repositories = new Repositories(this);
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
