const v4 = require('uuid/v4');

class RolesRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createRole(name, organizationId, applicationId) {
        const payload = {
            name,
            organizationId,
            applicationId,
            deleted: false,
            id: v4()
        };

        try {
            const q = this.uow._models.Role
                .query(this.uow._transaction)
                .insertAndFetch(payload);

            const role = await q;

            return role;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create role`);
            throw err;
        }
    }

    async getRoleById(roleId) {
        try {
            const q = this.uow._models.Role
                .query(this.uow._transaction)
                .where('id', roleId);

            const role = await q;

            return role[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch role using id: ${permissionId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllRoles() {
        try {
            const q = this.uow._models.Role
                .query(this.uow._transaction);

            const roles = await q;

            return roles;
        } catch (err) {
            this.uow._logger.error(`Failed to fetch roles`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async updateRolePermissions(roleId, permissionIds) {
        try {
            await this.uow._models.RolePermission
                .query(this.uow._transaction)
                .where({roleId})
                .delete();

            const rolePermissions = permissionIds.map((id) => {
                return {
                    permissionId: id,
                    roleId
                };
            });

            const q = this.uow._models.RolePermission
                .query(this.uow._transaction)
                .insertAndFetch(rolePermissions);

            return await q;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to update role permissions`);
            throw err;
        }
    }
}

module.exports = RolesRepository;
