const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class OrganizationApplication extends BaseModel {
    static get tableName() {
        return 'organizationApplications';
    }

    auto_generated_id() {
        return ['organizationId', 'applicationId']
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                organizationId: { type: 'uuid' },
                applicationId: { type: 'uuid' }
            }
        };
    }

    static get relationMappings() {
        const Application = require('./application');
        const Organization = require('./organization');

        return {
            applications: {
                relation: Model.HasOneRelation,
                modelClass: Application,
                join: {
                    from: 'organizationApplications.applicationId',
                    to: 'applications.id'
                }
            },
            organizations: {
                relation: Model.HasOneRelation,
                modelClass: Organization,
                join: {
                    from: 'organizationApplication.organizationId',
                    to: 'organizations.id'
                }
            }
        };
    }
}

module.exports = OrganizationApplication;
