
exports.up = async function(knex, Promise) {
    await knex.schema.createTable('forgotPasswords', t => {
        t.uuid('id')
            .notNullable()
            .primary();
        t.uuid('userEmailId').references('id').inTable('userEmails');
        t.dateTime('createdAt');
        t.uuid('userId').references('id').inTable('users');
        t.dateTime('triggeredAt');
    });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('forgotPasswords');
};
