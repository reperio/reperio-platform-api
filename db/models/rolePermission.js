const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class RolePermission extends BaseModel {
    static get tableName() {
        return 'rolePermissions';
    }
    
    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                roleId: { type: 'string' },
                permissionName: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const Role = require('./role');
        const Permission = require('./permission');

        return {
            role: {
                relation: Model.HasOneRelation,
                modelClass: Role,
                join: {
                    from: 'rolePermissions.roleId',
                    to: 'roles.id'
                }
            },
            permission: {
                relation: Model.HasOneRelation,
                modelClass: Permission,
                join: {
                    from: 'rolePermissions.permissionName',
                    to: 'permissions.name'
                }
            }
        };
    }
}

module.exports = RolePermission;