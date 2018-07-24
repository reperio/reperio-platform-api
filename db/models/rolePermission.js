const Model = require('objection').Model;

class RolePermission extends Model {
    static get tableName() {
        return 'rolePermissions';
    }

    static get idColumn() {
        return ['roleId', 'permissionId'];
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                roleId: { type: 'string' },
                permissionId: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const Role = require('./role');
        const Permission = require('./permission');

        return {
            roles: {
                relation: Model.HasOneRelation,
                modelClass: Role,
                join: {
                    from: 'rolePermissions.roleId',
                    to: 'roles.id'
                }
            },
            permissions: {
                relation: Model.HasOneRelation,
                modelClass: Permission,
                join: {
                    from: 'rolePermissions.permissionId',
                    to: 'permissions.id'
                }
            }
        };
    }
}

module.exports = RolePermission;