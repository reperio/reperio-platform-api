
exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.unique('primaryEmail');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.dropUnique('primaryEmail');
        });
};
