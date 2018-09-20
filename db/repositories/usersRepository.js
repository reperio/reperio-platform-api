const uuid4 = require("uuid/v4");

class UsersRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createUser(newUser, organizationIds) {
        try {
            const userModel = {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                password: newUser.password,
                primaryEmail: newUser.primaryEmail,
                primaryEmailVerified: false,
                disabled: false,
                deleted: false
            };

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
            this.uow._logger.error(`Failed to create user: ${newUser.primaryEmail}`);
            throw err;
        }
    }

    async editUser(modifiedUser, userId) {
        try {
            const userModel = {
                firstName: modifiedUser.firstName,
                lastName: modifiedUser.lastName,
                primaryEmail: modifiedUser.primaryEmail,
                primaryEmailVerified: modifiedUser.primaryEmailVerified,
                disabled: modifiedUser.disabled,
                deleted: modifiedUser.disabled
            };

            const user = await this.uow._models.User
                .query(this.uow._transaction)
                .patch(userModel)
                .where('id', userId);

            return user;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create user: ${modifiedUser.primaryEmail}`);
            throw err;
        }
    }

    async replaceUserOrganizations(userId, userOrganizations) {
        try {
            const insert = userOrganizations
                .map(item => {
                    return {
                        userId: userId,
                        organizationId: item
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
            this.uow._logger.error(`Failed to update a users organizations: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getUserById(userId) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .eager('userOrganizations.organization')
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

    async getUserByEmail(primaryEmail) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .eager('userOrganizations.organization')
                .where('primaryEmail', primaryEmail);

            const user = await q;

            return user[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user using email: ${primaryEmail}`);
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
            this.uow._logger.error(`Failed to update user roles`);
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
            this.uow._logger.error(`Failed to fetch user roles`);
            throw err;
        }
    }

    async deleteUser(id) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .patch({deleted: true})
                .where('id', id);

            const result = await q;

            return result;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to delete user`);
            throw err;
        }
    }

    async disableUser(id) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .patch({disabled: true})
                .where('id', id);

            const result = await q;

            return result;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to disable user`);
            throw err;
        }
    }
}

module.exports = UsersRepository;
