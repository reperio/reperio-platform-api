class PermissionService {
    getUserPermissions(user) {
        const userPermissions = user.userRoles != null && user.userRoles.length > 0 ? [...new Set(
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

const permissionService = new PermissionService();

module.exports = permissionService;