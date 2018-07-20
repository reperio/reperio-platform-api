const BaseModel = require('./baseModel');

class User extends BaseModel {
    static get tableName() {
        return 'users';
    }

    auto_generated_id() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                organizationId: {type: 'string'},
                createdAt: {type: 'date' },
                updatedAt: {type: 'date' }
            }
        };
    }
}

module.exports = User;
