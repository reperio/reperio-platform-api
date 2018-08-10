
exports.up = async function(knex, Promise) {
    await knex.schema
        .createTable('organizationAddresses', t => {
            t.uuid('organizationId').references('organizations.id');
            t.string('address1');
            t.string('address2');
            t.string('city');
            t.string('state');
            t.string('zip');
            t.boolean('deleted');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('organizationAddresses');
};
