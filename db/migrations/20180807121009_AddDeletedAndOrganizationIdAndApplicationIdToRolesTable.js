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
            t.dropColumn('deleted');
            t.string('description');
            t.dropColumn('organizationId');   
            t.dropColumn('applicationId');
        });
};
