exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('organizations', t => {
            t.boolean('personal');
            t.boolean('deleted');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('organizations', t => {
            t.dropColumn('personal');
            t.dropColumn('deleted');
        });
};
