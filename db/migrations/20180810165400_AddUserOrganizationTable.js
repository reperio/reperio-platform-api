exports.up = async function(knex, Promise) {
    await knex.schema
        .createTable('userOrganizations', t => {
            t.uuid('organizationId').references('organizations.id');
            t.uuid('userId').references('users.id');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userOrganizations');
};
