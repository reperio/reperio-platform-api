
exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.dropColumn('organizationId');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.uuid('organizationId');
        });
};
