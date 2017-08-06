const db = require('./models');
const UsersRepository = require("./repositories/usersRepository");

class DataModel {
    constructor() {
        this._db = db;

        this._usersRepository = null;
    }

    get usersRepository() {
        this._usersRepository = this._usersRepository || new UsersRepository(this);
        return this._usersRepository;
    }
}

module.exports = DataModel;