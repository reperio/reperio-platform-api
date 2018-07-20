const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class Role extends BaseModel {
    static get tableName() {
        return 'roles';
    }

    auto_generated_id() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const RolePermission = require('./rolePermission');

        return {
            permissions: {
                relation: Model.HasManyRelation,
                modelClass: RolePermission,
                join: {
                    from: 'roles.id',
                    to: 'rolePermissions.roleId'
                }
            }
        };
    }
}

module.exports = Role;
