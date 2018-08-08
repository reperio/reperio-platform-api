exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.string('primaryEmail');
            t.boolean('primaryEmailVerified');
            t.boolean('disabled');
            t.boolean('deleted');
            t.dropColumn('email');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.dropColumn('primaryEmail');
            t.dropColumn('primaryEmailVerified');
            t.dropColumn('disabled');
            t.dropColumn('deleted');
            t.string('email');
        });
};
