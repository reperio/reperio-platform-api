
exports.up = async function(knex, Promise) {
    await knex.schema
        .createTable('applicationOrganizations', t => {
            t.uuid('applicationId').references('applications.id');
            t.uuid('organizationId').references('organizations.id');
            t.boolean('active');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('applicationOrganizations');
};
