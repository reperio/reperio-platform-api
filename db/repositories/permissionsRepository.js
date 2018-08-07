const v4 = require('uuid/v4');

class PermissionsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createPermission(name, description, applicationId) {
        const payload = {
            name,
            description,
            deleted: false,
            applicationId,
            id: v4()
        };

        try {
            const q = this.uow._models.Permission
                .query(this.uow._transaction)
                .insertAndFetch(payload);

            const permission = await q;

            return permission;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create permission`);
            throw err;
        }
    }

    async getPermissionById(permissionId) {
        try {
            const q = this.uow._models.Permission
                .query(this.uow._transaction)
                .where('id', permissionId);

            const permission = await q;

            return permission[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch permission using id: ${permissionId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllPermissions() {
        try {
            const q = this.uow._models.Permission
                .query(this.uow._transaction);

            const permissions = await q;

            return permissions;
        } catch (err) {
            this.uow._logger.error(`Failed to fetch permissions`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = PermissionsRepository;
