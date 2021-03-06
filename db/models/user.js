const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class User extends BaseModel {
    static get tableName() {
        return 'users';
    }

    autoGeneratedId() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                primaryEmailAddress: { type: 'string' },
                password: { type: ['string', 'null']},
                disabled: { type: 'boolean' },
                deleted: { type: 'boolean' },
                emailVerified: { type: 'boolean' }
            }
        };
    }

    static get relationMappings() {
        const UserPhone = require('./userPhone');
        const UserRole = require('./userRole');

        return {
            userPhones: {
                relation: Model.HasManyRelation,
                modelClass: UserPhone,
                join: {
                    from: 'users.id',
                    to: 'userPhones.userId'
                }
            },
            userRoles: {
                relation: Model.HasManyRelation,
                modelClass: UserRole,
                join: {
                    from: 'users.id',
                    to: 'userRoles.userId'
                }
            }
        };
    }
}

module.exports = User;
