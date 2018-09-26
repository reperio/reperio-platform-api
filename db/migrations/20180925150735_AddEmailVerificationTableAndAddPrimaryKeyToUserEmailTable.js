
exports.up = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userEmails');
    await knex.schema
        .createTable('userEmails', t => {
            t.uuid('id')
                .notNullable()
                .primary();
            t.uuid('userId').references('id').inTable('users');
            t.string('email');
            t.boolean('emailVerified');
            t.boolean('deleted');
        });

    await knex.schema.createTable('emailVerifications', t => {
        t.uuid('id')
            .notNullable()
            .primary();
        t.uuid('userEmailId').references('id').inTable('userEmails');
        t.dateTime('createdAt');
    });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('emailVerifications');

    await knex.schema
        .alterTable('userEmails', t => {
            t.dropColumn('id');
        });
};
