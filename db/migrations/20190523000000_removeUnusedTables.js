exports.up = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('accounts');
    await knex.schema.dropTableIfExists('organizationApplications');
    await knex.schema.dropTableIfExists('roleApplicationPermissions');
    await knex.schema.dropTableIfExists('userOrganizations');
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('accounts');
    await knex.schema.dropTableIfExists('organizationApplications');
    await knex.schema.dropTableIfExists('roleApplicationPermissions');
    await knex.schema.dropTableIfExists('userOrganizations');

    await knex.schema
        .createTable('userOrganizations', t => {
            t.uuid('organizationId').references('organizations.id');
            t.uuid('userId').references('users.id');
        });
    
    await knex.schema
        .createTable('organizationApplications', t => {
            t.uuid('organizationId').references('organizations.id');
            t.uuid('applicationId').references('applications.id');
        });
    
    await knex.schema
        .createTable('roleApplicationPermissions', t => {
            t.uuid('roleId').references('roles.id');
            t.uuid('applicationPermissionId');
        });

    await knex.schema.createTable('accounts', t => {
        t.uuid('id')
            .notNullable()
            .primary();
        t.string('name');
        t.dateTime('createdAt');
        t.dateTime('updatedAt');
    });
};
