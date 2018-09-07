exports.up = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userOrganizations');

    await knex.schema
        .createTable('userOrganizations', t => {
            t.uuid('organizationId').references('id').inTable('organizations');
            t.uuid('userId').references('id').inTable('users');

            t.primary(["organizationId", "userId"]);
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userOrganizations');

    await knex.schema
        .createTable('userOrganizations', t => {
            t.uuid('organizationId').references('organizations.id');
            t.uuid('userId').references('users.id');
        });
};
