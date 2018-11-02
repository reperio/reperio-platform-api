exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('rolePermissions', t => {
            t.primary(["roleId", "permissionId"]);
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('rolePermissions', t => {
            t.dropPrimary();
        });
};