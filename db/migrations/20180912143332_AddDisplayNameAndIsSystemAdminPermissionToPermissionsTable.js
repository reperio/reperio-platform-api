exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('permissions', t => {
            t.string('displayName');
            t.dateTime('lastEditedDate');
            t.dateTime('createdDate');
            t.boolean('isSystemAdminPermission');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('permissions', t => {
            t.dropColumn('displayName');
            t.dropColumn('lastEditedDate');
            t.dropColumn('createdDate');
            t.dropColumn('isSystemAdminPermission');
        });
};
