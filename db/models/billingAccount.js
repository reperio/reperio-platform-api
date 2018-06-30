const BaseModel = require('./baseModel');

class BillingAccount extends BaseModel {
    static get tableName() {
        return 'billingAccounts';
    }

    auto_generated_id() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                createdAt: {type: 'date' },
                updatedAt: {type: 'date' }
            }
        };
    }
}

module.exports = BillingAccount;
