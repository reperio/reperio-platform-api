const BaseModel = require('./baseModel');

class Account extends BaseModel {
    static get tableName() {
        return 'hosts';
    }

    auto_generated_id() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' }
            }
        };
    }
}

module.exports = Account;
