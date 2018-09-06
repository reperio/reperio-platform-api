const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class UserOrganization extends Model {
    static get tableName() {
        return 'userOrganizations';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                organizationId: { type: 'string' },
                userId: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const Organization = require('./organization');
        const User = require('./user');

        return {
            organization: {
                relation: Model.BelongsToOneRelation,
                modelClass: Organization,
                join: {
                    from: 'userOrganizations.organizationId',
                    to: 'organizations.id'
                }
            },
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'userOrganizations.userId',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = UserOrganization;