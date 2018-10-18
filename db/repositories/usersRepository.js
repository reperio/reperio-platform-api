class UsersRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createUser(userModel, organizationIds) {
        try {

            const user = await this.uow._models.User
                .query(this.uow._transaction)
                .insertAndFetch(userModel);

            const userOrganizationModel = organizationIds
                .map(organizationId => {
                    return {
                        userId: user.id,
                        organizationId
                    }
            });

            await this.uow._models.UserOrganization
                .query(this.uow._transaction)
                .insert(userOrganizationModel)
                .returning("*");

            return user;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create user: ${userModel.primaryEmailAddress}`);
            throw err;
        }
    }

    async editUser(modifiedUser, userId) {
        try {
            const user = await this.uow._models.User
                .query(this.uow._transaction)
                .patch(modifiedUser)
                .where('id', userId)
                .returning("*");

            return user[0];
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to edit user: ${userId}`);
            throw err;
        }
    }

    async replaceUserOrganizationsByUserId(userId, organizationIds) {
        try {
            const insert = organizationIds
                .map(organizationId => {
                    return {
                        userId,
                        organizationId
                    }
                });

            await this.uow._models.UserOrganization
                .query(this.uow._transaction)
                .where({userId})
                .delete()

            const q = await this.uow._models.UserOrganization
                .query(this.uow._transaction)
                .insert(insert)
                .returning("*");

        } catch (err) {
            this.uow._logger.error(`Failed to update a users organizations with userId: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async replaceUserOrganizationsByOrganizationId(organizationId, userIds) {
        try {
            const insert = userIds
                .map(userId => {
                    return {
                        userId,
                        organizationId
                    }
                });

            await this.uow._models.UserOrganization
                .query(this.uow._transaction)
                .where({organizationId})
                .delete()

            const q = await this.uow._models.UserOrganization
                .query(this.uow._transaction)
                .insert(insert)
                .returning("*");

        } catch (err) {
            this.uow._logger.error(`Failed to update user organizations with orgId: ${organizationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async replaceUserRoles(userId, userRoles) {
        try {
            const insert = userRoles
                .map(item => {
                    return {
                        userId: userId,
                        roleId: item
                    }
                });

            await this.uow._models.UserRole
                .query(this.uow._transaction)
                .where({userId})
                .delete()

            const q = await this.uow._models.UserRole
                .query(this.uow._transaction)
                .insert(insert)
                .returning("*");

        } catch (err) {
            this.uow._logger.error(`Failed to update a users roles: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getUserById(userId) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .mergeEager('userOrganizations.organization')
                .mergeEager('userRoles.role.rolePermissions.permission')
                .mergeEager('userEmails')
                .where('users.id', userId);

            const user = await q;

            return user[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user using id: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllUsers() {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .eager('userOrganizations.organization');

            const users = await q;

            return users;
        } catch (err) {
            this.uow._logger.error(`Failed to fetch users`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async verifyUserEmail(userEmailId) {
        try {
            const q = this.uow._models.UserEmail
                .query(this.uow._transaction)
                .patch({emailVerified: true})
                .where('id', userEmailId);

            const result = await q;

            return result;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to verify email: ${userEmailId}`);
            throw err;
        }
    }

    async getUserByEmail(primaryEmailAddress) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .mergeEager('userOrganizations.organization')
                .mergeEager('userRoles.role.rolePermissions.permission')
                .mergeEager('userEmails')
                .where('primaryEmailAddress', primaryEmailAddress);

            const user = await q;

            return user[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user using email: ${primaryEmailAddress}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async updateRoles(userId, roleIds) {
        try {
            await this.uow._models.UserRole
                .query(this.uow._transaction)
                .where({userId})
                .delete();

            const userRoles = roleIds.map((id) => {
                return {
                    roleId: id,
                    userId
                };
            });

            const q = this.uow._models.UserRole
                .query(this.uow._transaction)
                .insertAndFetch(userRoles);

            return await q;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to update user roles: ${userId}`);
            throw err;
        }
    }

    async getUserRoles(userId) {
        try {
            const userRoles = await this.uow._models.UserRole
                .query(this.uow._transaction)
                .where('userId', userId);

            const q = this.uow._models.Role
                .query(this.uow._transaction)
                .whereIn('id', userRoles.map((userRole) => {return userRole.roleId}));

            return await q;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to fetch user roles: ${userId}`);
            throw err;
        }
    }

    async deleteUser(userId) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .patch({deleted: true})
                .where('id', userId);

            const result = await q;

            return result;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to delete user: ${userId}`);
            throw err;
        }
    }

    async disableUser(userId) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .patch({disabled: true})
                .where('id', userId);

            const result = await q;

            return result;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to disable user: ${userId}`);
            throw err;
        }
    }
}

module.exports = UsersRepository;
