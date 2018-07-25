exports.up = async function(knex, Promise) {
    await knex.schema
        .createTable('applications', t => {
            t.uuid('id')
                .notNullable()
                .primary();
            t.string('name');
            t.string('description');
            t.string('baseUrl');
        })
        .createTable('organizationApplications', t => {
            t.uuid('organizationId').references('organizations.id');
            t.uuid('applicationId').references('applications.id');
        })
        .createTable('applicationPermissions', t => {
            t.uuid('id')
                .notNullable()
                .primary();
            t.uuid('applicationId').references('applications.id');
            t.string('permissionName');
            t.string('description');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('organizationApplications');
    await knex.schema.dropTableIfExists('applicationPermissions');
    await knex.schema.dropTableIfExists('applications');
};
