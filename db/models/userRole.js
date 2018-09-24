const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class UserRole extends BaseModel {
    static get tableName() {
        return 'userRoles';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                roleId: { type: 'string' },
                userId: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const Role = require('./role');
        const User = require('./user');

        return {
            role: {
                relation: Model.HasOneRelation,
                modelClass: Role,
                join: {
                    from: 'userRoles.roleId',
                    to: 'roles.id'
                }
            },
            users: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'userRoles.userId',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = UserRole;