const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class OrganizationAddress extends BaseModel {
    static get tableName() {
        return 'organizationAddresses';
    }

    auto_generated_id() {
        return ['organizationId', 'applicationId']
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                organizationId: { type: 'uuid' },
                address1: { type: 'string' },
                address2: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zip: { type: 'string' },
                deleted: { type: 'boolean' },
            }
        };
    }

    static get relationMappings() {
        const Organization = require('./organization');

        return {
            organizations: {
                relation: Model.HasOneRelation,
                modelClass: Organization,
                join: {
                    from: 'organizationAddresses.organizationId',
                    to: 'organizations.id'
                }
            }
        };
    }
}

module.exports = OrganizationAddress;
