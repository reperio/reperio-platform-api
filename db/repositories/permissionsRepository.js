const moment = require('moment');
const QueryHelper = require('../../helpers/queryHelper');

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

    async getAllPermissionsQuery(queryParameters) {
        const queryHelper = new QueryHelper(this.uow, this.uow._logger);
        try {
            const q = this.uow._models.Permission
                .query(this.uow._transaction)
                .eager('rolePermissions.role');

            return await queryHelper.getQueryResult(q, queryParameters);
        } catch (err) {
            this.uow._logger.error(`Failed to fetch permissions by query`);
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
            this.uow._logger.error(`Failed to edit permission`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async managePermissionsUsedByRoles(rolePermissions, permissionName) {
        try {
            await this.uow._models.RolePermission
                .query(this.uow._transaction)
                .where({permissionName})
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
