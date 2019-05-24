exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('roles', t => {
            t.dropColumn('applicationId');
        });
    await knex.schema
        .alterTable('permissions', t => {
            t.dropColumn('applicationId');
        });
};

exports.down = async function (knex, Promise) {
    await knex.schema
        alterTable('roles', t => {
            t.uuid('applicationId');
        });
    await knex.schema
        alterTable('permissions', t => {
            t.uuid('applicationId');
        });
};