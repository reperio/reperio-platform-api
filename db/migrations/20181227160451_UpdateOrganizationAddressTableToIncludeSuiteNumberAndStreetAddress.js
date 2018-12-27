exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('organizationAddresses', t => {
            t.primary('organizationId');
            t.renameColumn('address1', 'streetAddress');
            t.renameColumn('address2', 'suiteNumber');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('organizationAddresses', t => {
            t.dropPrimary();
            t.renameColumn('streetAddress', 'address1');
            t.renameColumn('suiteNumber', 'address2');
        });
};