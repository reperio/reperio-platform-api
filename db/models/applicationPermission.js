const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class ApplicationPermission extends BaseModel {
    static get tableName() {
        return 'applicationPermissions';
    }

    auto_generated_id() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: { type: 'uuid' },
                applicationId: { type: 'uuid' },
                permissionName: { type: 'string' },
                description: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const OrganizationApplication = require('./organizationApplication');

        return {
            organizationApplications: {
                relation: Model.HasManyRelation,
                modelClass: OrganizationApplication,
                join: {
                    from: 'applicationPermissions.id',
                    to: 'organizationApplications.applicationId'
                }
            }
        };
    }
}

module.exports = ApplicationPermission;
