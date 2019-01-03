exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('organizationAddresses', t => {
            t.string('suiteNumber').alter();
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('organizationAddresses', t => {
            t.integer('suiteNumber').alter();
        });
};