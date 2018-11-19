module.exports = {
    beginTransaction: async () => { },
    commitTransaction: async () => { },
    rollbackTransaction: async () => { },
    inTransaction: async () => { },
    accountsRepository: {
        getAllBillingAccounts: async () => { }
    },
    applicationsRepository: {
        createApplication: async () => { },
        deleteApplication: async () => { },
        getApplicationById: async () => { },
        getAllApplications: async () => { }
    },
    emailVerificationsRepository: {
        addEntry: async () => { return '7e4d496d-843b-0647-eb86-fad0e85ede74'; },
        getEntry: async () => { },
        trigger: async () => { }
    },
    forgotPasswordRepository: {
        addEntry: async () => { },
        getEntry: async () => { },
        trigger: async () => { }
    },
    organizationsRepository: {
        createOrganization: async () => { return '7e4d496d-843b-0647-eb86-fad0e85ede72'; },
        deleteOrganization: async () => { },
        getOrganizationById: async () => { },
        getOrganizationsByUser: async () => { },
        getAllOrganizations: async () => { },
        editOrganization: async () => { }
    },
    permissionsRepository: {
        getPermissionById: async () => { },
        getAllPermissions: async () => { },
        editPermission: async () => { },
        managePermissionsUsedByRoles: async () => { }
    },
    rolesRepository: {
        createRole: async () => { },
        getRoleById: async () => { },
        getAllRoles: async () => { },
        getAllActiveRoles: async () => { },
        editRole: async () => { },
        updateRolePermissions: async () => { },
        deleteRole: async () => { }
    },
    userEmailsRepository: {
        createUserEmail: async () => { return '7e4d496d-843b-0647-eb86-fad0e85ede73'; },
        getUserEmail: async () => { },
        getAllUserEmails: async () => { },
        editUserEmails: async () => { }
    },
    usersRepository: {
        createUser: async () => { return {}; },
        editUser: async () => { return {}; },
        replaceUserOrganizationsByUserId: async () => { return {}; },
        replaceUserOrganizationsByOrganizationId: async () => { return {}; },
        replaceUserRoles: async () => { return {}; },
        getUserById: async () => { return {}; },
        getAllUsers: async () => {
            // return admin user as a list
            return [{
                "id": "d08a1f76-7c4a-4dd9-a377-83ffffa752f4",
                "firstName": "admin",
                "lastName": "user",
                "password": '$2a$12$pRM5xSQ5MQp7R8gy9..TBe.x1ZyBcWRSIrPMT5UqboatLi3gaDZUe',
                "disabled": false,
                "deleted": false,
                "primaryEmailId": "a0ae75a5-72fe-429b-b3a4-37701c48ff63",
                "primaryEmailAddress": "support@reper.io",
                "userOrganizations": [
                    {
                        "organizationId": "966f4157-934c-45e7-9f44-b1e5fd8b79a7",
                        "userId": "d08a1f76-7c4a-4dd9-a377-83ffffa752f4",
                        "organization": {
                            "id": "966f4157-934c-45e7-9f44-b1e5fd8b79a7",
                            "name": "Test Organization",
                            "personal": true,
                            "deleted": false
                        }
                    }
                ],
                "userEmails": [
                    {
                        "id": "a0ae75a5-72fe-429b-b3a4-37701c48ff63",
                        "userId": "d08a1f76-7c4a-4dd9-a377-83ffffa752f4",
                        "email": "support@reper.io",
                        "emailVerified": true,
                        "deleted": false
                    }
                ],
                "userRoles": [
                    {
                        "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                        "userId": "d08a1f76-7c4a-4dd9-a377-83ffffa752f4",
                        "role": {
                            "id": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                            "name": "Core Super Admin",
                            "deleted": false,
                            "applicationId": null,
                            "organizationId": "966f4157-934c-45e7-9f44-b1e5fd8b79a7",
                            "rolePermissions": [
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ViewUsers",
                                    "permission": {
                                        "name": "ViewUsers",
                                        "description": "Allows for viewing all users",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "View Users",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "CreateUsers",
                                    "permission": {
                                        "name": "CreateUsers",
                                        "description": "Allows creation of users",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Create Users",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "DeleteUsers",
                                    "permission": {
                                        "name": "DeleteUsers",
                                        "description": "Allows deletion of users",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Delete Users",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ManageUserOrganizations",
                                    "permission": {
                                        "name": "ManageUserOrganizations",
                                        "description": "Allows addition / deletion of organizations the user belongs to",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Manage User Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ManageUserRoles",
                                    "permission": {
                                        "name": "ManageUserRoles",
                                        "description": "Allows addition / deletion of roles the user has",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Manage User Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "AddEmail",
                                    "permission": {
                                        "name": "AddEmail",
                                        "description": "Allows addition of user emails",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Add Email",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "SetPrimaryEmail",
                                    "permission": {
                                        "name": "SetPrimaryEmail",
                                        "description": "Allows a user's primary email address to be changed",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Set Primary Email",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "DeleteEmail",
                                    "permission": {
                                        "name": "DeleteEmail",
                                        "description": "Allows deletion of user emails",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Delete Email",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ViewRoles",
                                    "permission": {
                                        "name": "ViewRoles",
                                        "description": "Allows for viewing all roles",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "View Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "CreateRoles",
                                    "permission": {
                                        "name": "CreateRoles",
                                        "description": "Allows for creating roles",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Create Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "UpdateRoles",
                                    "permission": {
                                        "name": "UpdateRoles",
                                        "description": "Allows for updating roles",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Update Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "DeleteRoles",
                                    "permission": {
                                        "name": "DeleteRoles",
                                        "description": "Allows for deleting roles",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Delete Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ViewOrganizations",
                                    "permission": {
                                        "name": "ViewOrganizations",
                                        "description": "Allows for viewing all organiations",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "View Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "CreateOrganizations",
                                    "permission": {
                                        "name": "CreateOrganizations",
                                        "description": "Allows for creating organizations",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Create Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "UpdateOrganizations",
                                    "permission": {
                                        "name": "UpdateOrganizations",
                                        "description": "Allows for updating organizations",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Update Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "DeleteOrganizations",
                                    "permission": {
                                        "name": "DeleteOrganizations",
                                        "description": "Allows for deleting organizations",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Delete Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ViewPermissions",
                                    "permission": {
                                        "name": "ViewPermissions",
                                        "description": "Allows for viewing all permissions",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "View Permissions",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "UpdatePermissions",
                                    "permission": {
                                        "name": "UpdatePermissions",
                                        "description": "Allows for updating permissions",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Update Permissions",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "UpdateBasicUserInfo",
                                    "permission": {
                                        "name": "UpdateBasicUserInfo",
                                        "description": "Allows for updating first and last name of user",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Update Basic User Info",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                }
                            ]
                        }
                    }
                ]
            }]
        },
        verifyUserEmail: async () => { return {}; },
        getUserByEmail: async (email) => {
            if (email !== 'support@reper.io') {
                return null;
            }

            // return admin user
            return {
                "id": "d08a1f76-7c4a-4dd9-a377-83ffffa752f4",
                "firstName": "admin",
                "lastName": "user",
                "password": '$2a$12$pRM5xSQ5MQp7R8gy9..TBe.x1ZyBcWRSIrPMT5UqboatLi3gaDZUe',
                "disabled": false,
                "deleted": false,
                "primaryEmailId": "a0ae75a5-72fe-429b-b3a4-37701c48ff63",
                "primaryEmailAddress": "support@reper.io",
                "userOrganizations": [
                    {
                        "organizationId": "966f4157-934c-45e7-9f44-b1e5fd8b79a7",
                        "userId": "d08a1f76-7c4a-4dd9-a377-83ffffa752f4",
                        "organization": {
                            "id": "966f4157-934c-45e7-9f44-b1e5fd8b79a7",
                            "name": "Test Organization",
                            "personal": true,
                            "deleted": false
                        }
                    }
                ],
                "userEmails": [
                    {
                        "id": "a0ae75a5-72fe-429b-b3a4-37701c48ff63",
                        "userId": "d08a1f76-7c4a-4dd9-a377-83ffffa752f4",
                        "email": "support@reper.io",
                        "emailVerified": true,
                        "deleted": false
                    }
                ],
                "userRoles": [
                    {
                        "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                        "userId": "d08a1f76-7c4a-4dd9-a377-83ffffa752f4",
                        "role": {
                            "id": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                            "name": "Core Super Admin",
                            "deleted": false,
                            "applicationId": null,
                            "organizationId": "966f4157-934c-45e7-9f44-b1e5fd8b79a7",
                            "rolePermissions": [
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ViewUsers",
                                    "permission": {
                                        "name": "ViewUsers",
                                        "description": "Allows for viewing all users",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "View Users",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "CreateUsers",
                                    "permission": {
                                        "name": "CreateUsers",
                                        "description": "Allows creation of users",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Create Users",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "DeleteUsers",
                                    "permission": {
                                        "name": "DeleteUsers",
                                        "description": "Allows deletion of users",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Delete Users",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ManageUserOrganizations",
                                    "permission": {
                                        "name": "ManageUserOrganizations",
                                        "description": "Allows addition / deletion of organizations the user belongs to",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Manage User Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ManageUserRoles",
                                    "permission": {
                                        "name": "ManageUserRoles",
                                        "description": "Allows addition / deletion of roles the user has",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Manage User Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "AddEmail",
                                    "permission": {
                                        "name": "AddEmail",
                                        "description": "Allows addition of user emails",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Add Email",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "SetPrimaryEmail",
                                    "permission": {
                                        "name": "SetPrimaryEmail",
                                        "description": "Allows a user's primary email address to be changed",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Set Primary Email",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "DeleteEmail",
                                    "permission": {
                                        "name": "DeleteEmail",
                                        "description": "Allows deletion of user emails",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Delete Email",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ViewRoles",
                                    "permission": {
                                        "name": "ViewRoles",
                                        "description": "Allows for viewing all roles",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "View Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "CreateRoles",
                                    "permission": {
                                        "name": "CreateRoles",
                                        "description": "Allows for creating roles",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Create Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "UpdateRoles",
                                    "permission": {
                                        "name": "UpdateRoles",
                                        "description": "Allows for updating roles",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Update Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "DeleteRoles",
                                    "permission": {
                                        "name": "DeleteRoles",
                                        "description": "Allows for deleting roles",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Delete Roles",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ViewOrganizations",
                                    "permission": {
                                        "name": "ViewOrganizations",
                                        "description": "Allows for viewing all organiations",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "View Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "CreateOrganizations",
                                    "permission": {
                                        "name": "CreateOrganizations",
                                        "description": "Allows for creating organizations",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Create Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "UpdateOrganizations",
                                    "permission": {
                                        "name": "UpdateOrganizations",
                                        "description": "Allows for updating organizations",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Update Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "DeleteOrganizations",
                                    "permission": {
                                        "name": "DeleteOrganizations",
                                        "description": "Allows for deleting organizations",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Delete Organizations",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "ViewPermissions",
                                    "permission": {
                                        "name": "ViewPermissions",
                                        "description": "Allows for viewing all permissions",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "View Permissions",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "UpdatePermissions",
                                    "permission": {
                                        "name": "UpdatePermissions",
                                        "description": "Allows for updating permissions",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Update Permissions",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                },
                                {
                                    "roleId": "e37c87b4-b92e-11e8-96f8-529269fb1459",
                                    "permissionName": "UpdateBasicUserInfo",
                                    "permission": {
                                        "name": "UpdateBasicUserInfo",
                                        "description": "Allows for updating first and last name of user",
                                        "deleted": false,
                                        "applicationId": null,
                                        "displayName": "Update Basic User Info",
                                        "lastEditedDate": "2018-11-04T15:04:38.000Z",
                                        "createdDate": "2018-11-04T15:04:38.000Z",
                                        "isSystemAdminPermission": false
                                    }
                                }
                            ]
                        }
                    }
                ]
            };
        },
        updateRoles: async () => { return {}; },
        getUserRoles: async () => { return {}; },
        deleteUser: async () => { return {}; },
        disableUser: async () => { return {}; }
    }
}