const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class ApplicationOrganization extends BaseModel {
    static get tableName() {
        return 'applicationOrganizations';
    }

    auto_generated_id() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                applicationId: { type: 'uuid' },
                organizationId: { type: 'uuid' },
                active: { type: 'boolean' }
            }
        };
    }

    static get relationMappings() {
        const Organization = require('./organization');
        const Application = require('./application');

        return {
            organizations: {
                relation: Model.HasOneRelation,
                modelClass: Organization,
                join: {
                    from: 'applicationOrganizations.organizationId',
                    to: 'organizations.id'
                }
            },
            applications: {
                relation: Model.HasOneRelation,
                modelClass: Application,
                join: {
                    from: 'applicationOrganizations.applicationId',
                    to: 'applications.id'
                }
            }
        };
    }
}

module.exports = ApplicationOrganization;
