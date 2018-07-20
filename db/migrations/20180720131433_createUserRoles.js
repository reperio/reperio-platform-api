
exports.up = async function(knex, Promise) {
    await knex.schema
        .createTable('userRoles', t => {
            t.uuid('roleId').references('roles.id');
            t.uuid('userId').references('users.id');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('userRoles');
};
