class PermissionService {
    getUserPermissions(user) {
        const userPermissions = user.userRoles ? [...new Set(
            user.userRoles
                .map(userRole => userRole.role.rolePermissions)[0]
                .map(rolePermission => rolePermission.permission.name)
        )] : [];

        return userPermissions;
    }

    userHasRequiredPermissions(userPermissions, routePermissions) {
        return routePermissions.every(val => userPermissions.includes(val));
    }
}

module.exports = PermissionService;