exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('applications', t => {
            t.dropColumn('baseUrl');
            t.dropColumn('description');
            t.string('apiUrl');
            t.string('clientUrl');
            t.string('secretKey');
            t.boolean('deleted');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('applications', t => {
            t.string('baseUrl');
            t.string('description');
            t.dropColumn('apiUrl');
            t.dropColumn('clientUrl');
            t.dropColumn('secretKey');
            t.dropColumn('deleted');
        });
};
