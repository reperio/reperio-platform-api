
exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.dropColumn('createdAt');
            t.dropColumn('updatedAt');
        })
        .alterTable('organizations', t => {
            t.dropColumn('createdAt');
            t.dropColumn('updatedAt');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.dateTime('createdAt');
            t.dateTime('updatedAt');
        })
        .alterTable('organizations', t => {
            t.dateTime('createdAt');
            t.dateTime('updatedAt');
        });
};
