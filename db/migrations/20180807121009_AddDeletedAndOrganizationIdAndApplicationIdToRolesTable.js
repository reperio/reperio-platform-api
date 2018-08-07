exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('roles', t => {
            t.boolean('deleted');
            t.dropColumn('description');
            t.uuid('organizationId')                
                .notNullable();
            t.uuid('applicationId');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('roles', t => {
            t.dropCoumn('deleted');
            t.string('description');
            t.dropCoumn('organizationId');   
            t.dropCoumn('applicationId');
        });
};
