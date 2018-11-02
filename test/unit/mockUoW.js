module.exports = {
    beginTransaction: async () => {},
    commitTransaction: async () => {},
    rollbackTransaction: async () => {},
    inTransaction: async () => {},
    accountsRepository: {
        getAllBillingAccounts: async () => {}
    },
    applicationsRepository: {
        createApplication: async () => {},
        deleteApplication: async () => {},
        getApplicationById: async () => {},
        getAllApplications: async () => {}
    },
    emailVerificationsRepository: {
        addEntry: async () => {},
        getEntry: async () => {},
        trigger: async () => {}
    },
    forgotPasswordRepository: {
        addEntry: async () => {},
        getEntry: async () => {},
        trigger: async () => {}
    },
    organizationsRepository: {
        createOrganization: async () => {},
        deleteOrganization: async () => {},
        getOrganizationById: async () => {},
        getOrganizationsByUser: async () => {},
        getAllOrganizations: async () => {},
        editOrganization: async () => {}
    },
    permissionsRepository: {
        getPermissionById: async () => {},
        getAllPermissions: async () => {},
        editPermission: async () => {},
        managePermissionsUsedByRoles: async () => {}
    },
    rolesRepository: {
        createRole: async () => {},
        getRoleById: async () => {},
        getAllRoles: async () => {},
        getAllActiveRoles: async () => {},
        editRole: async () => {},
        updateRolePermissions: async () => {},
        deleteRole: async () => {}
    },
    userEmailsRepository: {
        createUserEmail: async () => {},
        getUserEmail: async () => {},
        getAllUserEmails: async () => {},
        editUserEmails: async () => {}
    },
    usersRepository: {
        createUser: async () => {},
        editUser: async () => {},
        replaceUserOrganizationsByUserId: async () => {},
        replaceUserOrganizationsByOrganizationId: async () => {},
        replaceUserRoles: async () => {},
        getUserById: async () => {},
        getAllUsers: async () => {},
        verifyUserEmail: async () => {},
        getUserByEmail: async () => {},
        updateRoles: async () => {},
        getUserRoles: async () => {},
        deleteUser: async () => {},
        disableUser: async () => {}
    }
}