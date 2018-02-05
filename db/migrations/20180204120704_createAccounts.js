
exports.up = async function(knex) {
    await knex.schema.createTable('accounts', t => {
        t.uuid('id')
            .notNullable()
            .primary();
        t.text('name');
        t.dateTime('createdAt');
        t.dateTime('updatedAt');
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('snapshots');
};
