const db = require("./models");
const UsersRepository = require("./repositories/usersRepository");

class UnitOfWork {
    constructor() {
        this._db = db;
        this._transaction = null;

        this._usersRepository = null;
    }

    async begin(...args) {
        if (this._transaction != null) {
            throw new Error("A transaction already exists for this unit of work");
        }
        this._transaction = await db.sequelize.transaction(...args);
    }

    async commit() {
        if (this._transaction == null) {
            throw new Error("A transaction does not exist for this unit of work");
        }
        await this._transaction.commit();
        this._transaction = null;
    }

    async rollback() {
        if (this._transaction == null) {
            throw new Error("A transaction does not exist for this unit of work");
        }
        await this._transaction.rollback();
        this._transaction = null;
    }

    get inTransaction() {
        return this._transaction != null;
    }

    get usersRepository() {
        this._usersRepository = this._usersRepository || new UsersRepository(this);
        return this._usersRepository;
    }
}

module.exports = UnitOfWork;