const BaseModel = require('./baseModel');

class UserEmails extends BaseModel {
    static get tableName() {
        return 'userEmails';
    }

    static get idColumn() {
        return ['userId'];
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                userId: { type: 'uuid' },
                emailVerified: { type: 'boolean' },
                email: { type: 'string' },
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
                    from: 'userEmails.userId',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = UserEmails;
