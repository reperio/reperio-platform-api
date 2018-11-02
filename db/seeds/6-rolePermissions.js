exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('rolePermissions').del()
    // Inserts seed entries
    await knex('rolePermissions').insert([
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'ViewUsers'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'CreateUsers'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'DeleteUsers'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'ManageUserOrganizations'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'ManageUserRoles'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'AddEmail'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'SetPrimaryEmail'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'DeleteEmail'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'ViewRoles'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'CreateRoles'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'UpdateRoles'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'DeleteRoles'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'ViewOrganizations'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'CreateOrganizations'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'UpdateOrganizations'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'DeleteOrganizations'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'ViewPermissions'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'UpdatePermissions'
        },
        {
            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            permissionName: 'UpdateBasicUserInfo'
        }
    ]);
};