const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class Permission extends BaseModel {
    static get tableName() {
        return 'permissions';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                name: { type: 'string' },
                displayName: { type: 'string' },
                description: { type: 'string' },
                deleted: { type: 'boolean' },
                isSystemAdminPermission: { type: 'boolean' },
                createdDate: { type: 'dateTime' },
                lastEditedDate: { type: 'dateTime' },
                applicationId: { type: 'uuid' }
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
                    from: 'permissions.name',
                    to: 'rolePermissions.permissionName'
                }
            }
        };
    }
}

module.exports = Permission;
