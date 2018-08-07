exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('permissions', t => {
            t.boolean('deleted');
            t.uuid('applicationId');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
    .alterTable('permissions', t => {
        t.dropColumn('deleted');
        t.dropColumn('applicationId');
    });
};
