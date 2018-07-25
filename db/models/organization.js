const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class Organization extends BaseModel {
    static get tableName() {
        return 'organizations';
    }

    auto_generated_id() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const User = require('./user');

        return {
            job_source_host: {
                relation: Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: 'organizations.id',
                    to: 'users.organizationId'
                }
            }
        };
    }
}

module.exports = Organization;
