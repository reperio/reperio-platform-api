
exports.up = async function(knex, Promise) {
    await knex.schema
        .createTable('userPhones', t => {
            t.uuid('userId').references('users.id');
            t.string('number');
            t.boolean('numberVerified');
            t.boolean('deleted');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userPhones');
};
