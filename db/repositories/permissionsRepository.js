const moment = require('moment');

class PermissionsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async getPermissionByName(name) {
        try {
            return await this.uow._models.Permission
                .query(this.uow._transaction)
                .where('name', name)
                .eager('rolePermissions.role')
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch permission: ${name}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllPermissions() {
        try {
            return await this.uow._models.Permission
                .query(this.uow._transaction)
                .eager('rolePermissions.role');
        } catch (err) { 
            this.uow._logger.error(`Failed to fetch permissions`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async editPermission(name, displayName, description, applicationId, isSystemAdminPermission) {
        const permission = {
            description,
            deleted: false,
            lastEditedDate: moment.utc().format(),
            applicationId,
            displayName,
            isSystemAdminPermission
        };

        try {
            return await this.uow._models.Permission
                .query(this.uow._transaction)
                .where({name})
                .patch(permission)
                .returning("*")
                .first();
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to edit permission`);
            throw err;
        }
    }

    async managePermissionsUsedByRoles(rolePermissions, permissionName) {
        try {
            const before = await this.uow._models.RolePermission
                .query(this.uow._transaction)
                .where({permissionId});

            await this.uow._models.RolePermission
                .query(this.uow._transaction)
                .where({permissionName})
                .delete();

            const after = await this.uow._models.RolePermission
                .query(this.uow._transaction)
                .insert(rolePermissions)
                .returning("*");

            return {before, after};
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to update role permissions`);
            throw err;
        }
    }
}

module.exports = PermissionsRepository;
