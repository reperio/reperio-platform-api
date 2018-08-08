const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class Application extends BaseModel {
    static get tableName() {
        return 'applications';
    }

    auto_generated_id() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: { type: 'uuid' },
                name: { type: 'string' },
                apiUrl: { type: 'string' },
                clientUrl: { type: 'string' },
                secretKey: { type: 'string' },
                deleted: { type: 'boolean' },
            }
        };
    }

    static get relationMappings() {
        const ApplicationPermission = require('./applicationPermission');
        const OrganizationApplication = require('./organizationApplication');

        return {
            applicationPermissions: {
                relation: Model.HasManyRelation,
                modelClass: ApplicationPermission,
                join: {
                    from: 'applications.id',
                    to: 'applicationPermissions.applicationId'
                }
            },
            organizationApplications: {
                relation: Model.HasManyRelation,
                modelClass: OrganizationApplication,
                join: {
                    from: 'applications.id',
                    to: 'organizationApplications.applicationId'
                }
            }
        };
    }
}

module.exports = Application;
