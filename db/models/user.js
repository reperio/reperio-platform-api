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
                id: { type: 'uuid' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                primaryEmail: { type: 'string' },
                primaryEmailVerified: { type: 'boolean' },
                password: { type: 'string' },
                disabled: { type: 'boolean' },
                deleted: { type: 'boolean' }
            }
        };
    }

    static get relationMappings() {
        const UserPhones = require('./userPhones');

        return {
            users: {
                relation: Model.HasManyRelation,
                modelClass: UserPhones,
                join: {
                    from: 'users.id',
                    to: 'userPhones.userId'
                }
            }
        };
    }
}

module.exports = User;
