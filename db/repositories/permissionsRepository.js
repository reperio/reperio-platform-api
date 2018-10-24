const v4 = require('uuid/v4');
const moment = require('moment');

class PermissionsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async getPermissionById(permissionId) {
        try {
            return await this.uow._models.Permission
                .query(this.uow._transaction)
                .where('id', permissionId)
                .eager('rolePermissions.role')
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch permission using id: ${permissionId}`);
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

    async editPermission(id, name, displayName, description, applicationId, isSystemAdminPermission) {
        const permission = {
            name,
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
                .where({id: id})
                .patch(permission)
                .returning("*")
                .first();
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to edit permission`);
            throw err;
        }
    }

    async managePermissionsUsedByRoles(rolePermissions, permissionId) {
        try {
            await this.uow._models.RolePermission
                .query(this.uow._transaction)
                .where({permissionId})
                .delete();

            return await this.uow._models.RolePermission
                .query(this.uow._transaction)
                .insert(rolePermissions)
                .returning("*");
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to update role permissions`);
            throw err;
        }
    }
}

module.exports = PermissionsRepository;
