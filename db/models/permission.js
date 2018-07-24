const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class Permission extends BaseModel {
    static get tableName() {
        return 'permissions';
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
            rolePermissions: {
                relation: Model.HasManyRelation,
                modelClass: RolePermission,
                join: {
                    from: 'permissions.id',
                    to: 'rolePermissions.permissionId'
                }
            }
        };
    }
}

module.exports = Permission;
