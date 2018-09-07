exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('roles', t => {
            t.dropColumn('organizationId');
        });

    await knex.schema
        .alterTable('roles', t => {
            t.uuid('organizationId').references('id').inTable('organizations');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('roles', t => {
            t.dropColumn('organizationId');
        });

    await knex.schema
        .alterTable('roles', t => {
            t.uuid('organizationId');
        });
};
