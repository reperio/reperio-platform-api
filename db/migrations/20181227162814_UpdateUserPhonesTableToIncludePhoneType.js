exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('userPhones', t => {
            t.primary('userId');
            t.string('phoneType');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('userPhones', t => {
            t.dropPrimary();
            t.dropColumn('phoneType');
        });
};