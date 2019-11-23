const QueryHelper = require('../../helpers/queryHelper');

class UsersRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createUser(userModel, organizationIds) {
        try {

            const user = await this.uow._models.User
                .query(this.uow._transaction)
                .insertAndFetch(userModel);
                
            return user;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create user: ${userModel.primaryEmailAddress}`);
            throw err;
        }
    }

    async editUser(modifiedUser, userId) {
        try {
            return await this.uow._models.User
                .query(this.uow._transaction)
                .patch(modifiedUser)
                .where('id', userId)
                .returning("*")
                .first();
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

            await this.uow._models.UserOrganization
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

            await this.uow._models.UserOrganization
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

            await this.uow._models.UserRole
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
            return await this.uow._models.User
                .query(this.uow._transaction)
                .mergeEager('userRoles.role.rolePermissions.permission')
                .mergeEager('userEmails')
                .mergeEager('userRoles.role.organization')
                .where('users.id', userId)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user using id: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getUsersByOrganizationId(organizationId) {
        try {
            return await this.uow._models.User
                .query(this.uow._transaction)
                .select(['users.*', 'roles.name AS role'])
                .join('userRoles', 'users.id', 'userRoles.userId')
                .join('roles', 'roles.id', 'userRoles.roleId')
                .where('roles.organizationId', organizationId);
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user using id: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllUsers() {
        try {
            return await this.uow._models.User
                .query(this.uow._transaction)
                .eager('userRoles.role.organization');
        } catch (err) {
            this.uow._logger.error(`Failed to fetch users`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllUsersQuery(queryParameters, organizationId = null) {
        const queryHelper = new QueryHelper(this.uow, this.uow._logger);
        try {
            let q;
            if (organizationId) {
                q = this.uow._models.User
                    .query(this.uow._transaction)
                    .join('userRoles', 'users.id', 'userRoles.userId')
                    .join('roles', 'userRoles.roleId', 'roles.id')
                    .join('organizations', 'roles.organizationId', 'organizations.id')
                    .where('organizations.id', '=', organizationId);

                return await queryHelper.getQueryResult(q, queryParameters);
            } else {
                q = this.uow._models.User
                    .query(this.uow._transaction)
                    .eager('userRoles.role.organization')
            }

            return await queryHelper.getQueryResult(q, queryParameters);
        } catch (err) {
            this.uow._logger.error(`Failed to fetch users by query`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async verifyUserEmail(userEmailId) {
        try {
            return await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .patch({emailVerified: true})
                .where('id', userEmailId);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to verify email: ${userEmailId}`);
            throw err;
        }
    }

    async getUserByEmail(primaryEmailAddress) {
        try {
            return await this.uow._models.User
                .query(this.uow._transaction)
                .mergeEager('userRoles.role.rolePermissions.permission')
                .mergeEager('userEmails')
                .where('primaryEmailAddress', primaryEmailAddress)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user using email: ${primaryEmailAddress}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async addRoles(userId, roleIds) {
        try {
            const userRoles = roleIds.map((id) => {
                return {
                    roleId: id,
                    userId
                };
            });

            return await this.uow._models.UserRole
                .query(this.uow._transaction)
                .insert(userRoles)
                .returning('roleId');
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to add user roles: ${userId}`);
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

            return await this.uow._models.UserRole
                .query(this.uow._transaction)
                .insertAndFetch(userRoles);
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

            return await this.uow._models.Role
                .query(this.uow._transaction)
                .whereIn('id', userRoles.map((userRole) => {return userRole.roleId}));
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to fetch user roles: ${userId}`);
            throw err;
        }
    }

    async deleteUser(userId) {
        try {
            return await this.uow._models.User
                .query(this.uow._transaction)
                .patch({deleted: true})
                .where('id', userId);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to delete user: ${userId}`);
            throw err;
        }
    }

    async disableUser(userId) {
        try {
            return await this.uow._models.User
                .query(this.uow._transaction)
                .patch({disabled: true})
                .where('id', userId);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to disable user: ${userId}`);
            throw err;
        }
    }

    async setPrimaryUserEmail(userId, userEmail) {
        try {
            return await this.uow._models.User
                .query(this.uow._transaction)
                .patch({primaryEmailAddress: userEmail.email, primaryEmailId: userEmail.id})
                .where('id', userId);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to set primary email for user: ${userId}`);
            throw err;
        }
    }
}

module.exports = UsersRepository;
