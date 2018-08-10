
exports.up = async function(knex, Promise) {
    await knex.schema
        .createTable('userEmails', t => {
            t.uuid('userId').references('users.id');
            t.string('email');
            t.boolean('emailVerified');
            t.boolean('deleted');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userEmails');
};
