
exports.up = async function(knex, Promise) {
    await knex.schema
        .createTable('permissions', t => {
            t.uuid('id')
                .notNullable()
                .primary();
            t.string('name');
            t.string('description');
        })
        .createTable('roles', t => {
            t.uuid('id')
                .notNullable()
                .primary();
            t.string('name');
            t.string('description');
        })
        .createTable('rolePermissions', t => {
            t.uuid('roleId').references('id').inTable('roles');
            t.uuid('permissionId').references('id').inTable('permissions');
        })
        .createTable('roleApplicationPermissions', t => {
            t.uuid('roleId').references('roles.id');
            t.uuid('applicationPermissionId');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('roleApplicationPermissions');
    await knex.schema.dropTableIfExists('rolePermissions');
    await knex.schema.dropTableIfExists('permissions');
    await knex.schema.dropTableIfExists('roles');
};