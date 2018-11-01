exports.up = async function(knex, Promise) {

    await knex.schema
        .alterTable('rolePermissions', t => {
            t.string('permissionName');
        });

    await knex.raw('UPDATE "rolePermissions" rp SET "permissionName" = (SELECT name FROM permissions p WHERE p.id = rp."permissionId")');

    await knex.schema
        .alterTable('rolePermissions', t => {
            t.dropPrimary();
            t.dropColumn('permissionId');
        });

    await knex.schema
        .alterTable('permissions', t => {
            t.dropPrimary();
            t.dropColumn('id');
        });

    await knex.schema
        .alterTable('permissions', t => {
            t.string('name')
                .alter()
                .primary();
        });

    await knex.schema
        .alterTable('rolePermissions', t => {
            t.string('permissionName')
                .alter()
                .references('name').inTable('permissions');
            t.primary(["roleId", "permissionName"]);
        });
};

exports.down = async function(knex, Promise) {

    await knex.schema
        .alterTable('rolePermissions', t => {
            t.dropForeign('permissionName');
        });

    await knex.schema
        .alterTable('permissions', t => {
            t.dropPrimary();
            t.uuid('id');
        });

    await knex.raw('UPDATE permissions SET id = uuid_generate_v4() WHERE id IS null');

    await knex.schema
        .alterTable('rolePermissions', t => {
            t.uuid('permissionId');
        });

    await knex.raw('UPDATE "rolePermissions" rp SET "permissionId" = (SELECT id FROM permissions p WHERE p.name = rp."permissionName")');

    await knex.schema
        .alterTable('rolePermissions', t => {
            t.dropPrimary();
            t.dropColumn('permissionName');
            t.uuid('permissionId')
                .alter()
                .notNullable();
        });

    await knex.schema
        .alterTable('permissions', t => {
            t.uuid('id')
                .alter()
                .primary();
        });

    await knex.schema
        .alterTable('rolePermissions', t => {
            t.uuid('permissionId')
                .alter()
                .references('id').inTable('permissions');
            t.primary(["roleId", "permissionId"]);
        });
};