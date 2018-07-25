const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class RoleApplicationPermission extends BaseModel {
    static get tableName() {
        return 'roleApplicationPermissions';
    }
    
    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                roleId: { type: 'string' },
                applicationPermissionId: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const Role = require('./role');

        return {
            roles: {
                relation: Model.HasManyRelation,
                modelClass: Role,
                join: {
                    from: 'roleApplicationPermissions.roleId',
                    to: 'roles.id'
                }
            }
        };
    }
}

module.exports = RoleApplicationPermission;
