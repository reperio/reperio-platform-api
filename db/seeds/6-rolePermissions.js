exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('rolePermissions').del()
    // Inserts seed entries
    await knex('rolePermissions').insert([
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionId: 'd2d6438c-b92e-11e8-96f8-529269fb1459'
        },
        {
            roleId: 'e37c8e4e-b92e-11e8-96f8-529269fb1459',
            permissionId: 'd2d654da-b92e-11e8-96f8-529269fb1459'
        }
    ]);
};