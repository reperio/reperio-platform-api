exports.up = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userRoles');

    await knex.schema
        .createTable('userRoles', t => {
            t.uuid('roleId').references('id').inTable('roles');
            t.uuid('userId').references('id').inTable('users');

            t.primary(["roleId", "userId"]);
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userRoles');

    await knex.schema
        .createTable('userRoles', t => {
            t.uuid('roleId').references('roles.id');
            t.uuid('userId').references('users.id');
        });
};
