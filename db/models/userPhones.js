const BaseModel = require('./baseModel');

class UserPhones extends BaseModel {
    static get tableName() {
        return 'userPhones';
    }

    static get idColumn() {
        return ['userId'];
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                userId: { type: 'uuid' },
                numberVerified: { type: 'boolean' },
                number: { type: 'string' },
                deleted: { type: 'boolean' }
            }
        };
    }

    static get relationMappings() {
        const User = require('./user');

        return {
            users: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'userPhones.userId',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = UserPhones;
