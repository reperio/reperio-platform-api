class RolesRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createRole(name, organizationId) {
        const payload = {
            name,
            organizationId,
            deleted: false
        };

        try {
            return await this.uow._models.Role
                .query(this.uow._transaction)
                .insertAndFetch(payload);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create role`);
            throw err;
        }
    }

    async getRoleById(roleId) {
        try {
            return await this.uow._models.Role
                .query(this.uow._transaction)
                .eager('rolePermissions.permission')
                .where('id', roleId)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch role using id: ${roleId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllRoles() {
        try {
            return await this.uow._models.Role
                .query(this.uow._transaction)
                .eager('rolePermissions.permission');
        } catch (err) {
            this.uow._logger.error(`Failed to fetch roles`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllActiveRoles() {
        try {
            return await this.uow._models.Role
                .query(this.uow._transaction)
                .eager('rolePermissions.permission')
                .where('deleted', false);
        } catch (err) {
            this.uow._logger.error(`Failed to fetch roles`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async editRole(roleId, name) {
        try {
            return await this.uow._models.Role
                .query(this.uow._transaction)
                .where({id: roleId})
                .patch({name})
                .returning("*")
                .first();
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to edit role`);
            throw err;
        }
    }

    async updateRolePermissions(roleId, permissionNames) {
        try {
            await this.uow._models.RolePermission
                .query(this.uow._transaction)
                .where({roleId})
                .delete();

            const rolePermissions = permissionNames.map((permissionName) => {
                return {
                    permissionName,
                    roleId
                };
            });

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

    async deleteRole(roleId) {
        try {
            return await this.uow._models.Role
                .query(this.uow._transaction)
                .patchAndFetchById(roleId, {deleted: true});
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to delete role`);
            throw err;
        }
    }
}

module.exports = RolesRepository;
