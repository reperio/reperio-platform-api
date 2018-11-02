const moment = require('moment');

exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('permissions').del()
    await knex('permissions').insert([
        {
            name: 'ViewUsers',
            displayName: 'View Users',
            description: 'Allows for viewing all users',
            isSystemAdminPermission: false,
            createdDate:  moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'CreateUsers',
            displayName: 'Create Users',
            description: 'Allows creation of users',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'DeleteUsers',
            displayName: 'Delete Users',
            description: 'Allows deletion of users',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'ManageUserOrganizations',
            displayName: 'Manage User Organizations',
            description: 'Allows addition / deletion of organizations the user belongs to',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'ManageUserRoles',
            displayName: 'Manage User Roles',
            description: 'Allows addition / deletion of roles the user has',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'AddEmail',
            displayName: 'Add Email',
            description: 'Allows addition of user emails',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'SetPrimaryEmail',
            displayName: 'Set Primary Email',
            description: "Allows a user's primary email address to be changed",
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'DeleteEmail',
            displayName: 'Delete Email',
            description: 'Allows deletion of user emails',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'ViewRoles',
            displayName: 'View Roles',
            description: 'Allows for viewing all roles',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'CreateRoles',
            displayName: 'Create Roles',
            description: 'Allows for creating roles',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'UpdateRoles',
            displayName: 'Update Roles',
            description: 'Allows for updating roles',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'DeleteRoles',
            displayName: 'Delete Roles',
            description: 'Allows for deleting roles',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'ViewOrganizations',
            displayName: 'View Organizations',
            description: 'Allows for viewing all organiations',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'CreateOrganizations',
            displayName: 'Create Organizations',
            description: 'Allows for creating organizations',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'UpdateOrganizations',
            displayName: 'Update Organizations',
            description: 'Allows for updating organizations',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'DeleteOrganizations',
            displayName: 'Delete Organizations',
            description: 'Allows for deleting organizations',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'ViewPermissions',
            displayName: 'View Permissions',
            description: 'Allows for viewing all permissions',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'UpdatePermissions',
            displayName: 'Update Permissions',
            description: 'Allows for updating permissions',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        },
        {
            name: 'UpdateBasicUserInfo',
            displayName: 'Update Basic User Info',
            description: 'Allows for updating first and last name of user',
            isSystemAdminPermission: false,
            createdDate: moment().utc().format(),
            lastEditedDate: moment().utc().format(),
            deleted: false
        }
    ]);
};