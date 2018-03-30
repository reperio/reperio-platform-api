
exports.up = async function(knex) {
    await knex.schema.createTable('users', t => {
        t.uuid('id')
            .notNullable()
            .primary();
        t.string('firstName');
        t.string('lastName');
        t.string('email');
        t.string('password');
        t.dateTime('createdAt');
        t.dateTime('updatedAt');
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('users');
};
