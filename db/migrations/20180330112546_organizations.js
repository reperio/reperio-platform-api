
exports.up = async function(knex) {
    await knex.schema.createTable('organizations', t => {
        t.uuid('id')
            .notNullable()
            .primary();
        t.string('name');
        t.dateTime('createdAt');
        t.dateTime('updatedAt');
    });

    await knex.schema.alterTable('users', t => {
        t.uuid('organizationId').references('organizations.id');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('users', t => {
        t.dropColumn('organizationId');
    });
    await knex.schema.dropTableIfExists('organizations');
};
