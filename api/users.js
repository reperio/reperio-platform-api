const Joi = require('joi');
const httpResponseService = require('./services/httpResponseService');
const emailService = require('./services/emailService');
const authService = require('./services/authService');
const permissionService = require('./services/permissionService');

module.exports = [
    {
        method: 'GET',
        path: '/users/{userId}',
        config: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            plugins: {
                requiredPermissions: (request) => request.params.userId === request.app.currentUserId ? [] : ['ViewUsers']
            },
            validate: {
                params: {
                    userId: Joi.string().uuid().required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            const userId = request.params.userId;

            logger.debug(`Fetching user ${userId}`);

            const user = await uow.usersRepository.getUserById(userId);
            if (user) {
                user.permissions = permissionService.getUserPermissions(user);
                user.password = null;
            }
            
            return user;
        }
    },
    {
        method: 'GET',
        path: '/users/exists',
        config: {
            auth: false,
            validate: {
                query: {
                    emailAddress: Joi.string().email(),
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            const emailAddress = request.query.emailAddress;

            logger.debug(`Getting User by primary email address`);
            logger.debug(`using email address: ${emailAddress}`);

            const user = await uow.usersRepository.getUserByEmail(emailAddress);

            if (user != null) {
                logger.debug(`A user exists that has that primary email address`);
                return true;
            }

            logger.debug(`A user does not exists that has that primary email address or it is not a valid email address`);
            return false;
        }
    },
    {
        method: 'GET',
        path: '/users',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers']
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all users`);

            const users = await uow.usersRepository.getAllUsers();

            users.forEach(x => x.password = null);

            return users;
        }
    },
    {
        method: 'GET',
        path: '/users/query',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers']
            },
            validate: {
                query: {
                    page: Joi.number(),
                    pageSize: Joi.number(),
                    sort: Joi.array().items(
                        Joi.object({
                            id: Joi.string(),
                            desc: Joi.bool()
                        })
                    ).optional(),
                    filter: Joi.array().items(
                        Joi.object({
                            id: Joi.string(),
                            value: Joi.string()
                        })
                    ).optional()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const query = request.query;

            logger.debug(`Fetching all users with query`);

            const { results, total } = await uow.usersRepository.getAllUsersQuery(query);

            results.forEach(x => x.password = null);

            let pages = Math.ceil(total / query.pageSize);
            
            return {
                data: results,
                pages
            };
        }
    },
    {
        method: 'POST',
        path: '/users',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers', 'CreateUsers']
            },
            validate: {
                payload: {
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    password: Joi.string().optional(),
                    confirmPassword: Joi.string().optional(),
                    primaryEmailAddress: Joi.string().required(),
                    organizationIds: Joi.array()
                    .items(
                        Joi.string().guid()
                    ).optional(),
                    applicationId: Joi.string().optional().allow(null).allow('')
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Creating user`);
            const payload = request.payload;

            //validate signup details
            if (payload.password !== payload.confirmPassword) {
                return httpResponseService.badData(h);
            }

            const userModel = {
                firstName: payload.firstName,
                lastName: payload.lastName,
                password: await authService.hashPassword(payload.password),
                primaryEmailAddress: payload.primaryEmailAddress,
                disabled: false,
                deleted: false
            };
            
            await uow.beginTransaction();

            const existingUser = await uow.usersRepository.getUserByEmail(userModel.primaryEmailAddress);
            if (existingUser != null) {
                return httpResponseService.conflict(h);
            }

            const personalOrganizationName = (`${payload.firstName} ${payload.lastName}`).substring(0, 255);
            const organization = await uow.organizationsRepository.createOrganization(personalOrganizationName, true);
            const user = await uow.usersRepository.createUser(userModel, payload.organizationIds.concat(organization.id));
            const userEmail = await uow.userEmailsRepository.createUserEmail(user.id, user.primaryEmailAddress);
            const updatedUser = await uow.usersRepository.editUser({primaryEmailId: userEmail.id}, user.id);
            const role = await uow.rolesRepository.createRole('Organization Admin', organization.id);
            const rolePermission = await uow.rolesRepository.updateRolePermissions(role.id, ['UpdateOrganization']);
            const userRole = await uow.usersRepository.addRoles(user.id, [role.id]);
            updatedUser.permissions = permissionService.getUserPermissions(updatedUser);

            await uow.commitTransaction();

            //send verification email
            await emailService.sendVerificationEmail(userEmail, uow, request, payload.applicationId);

            return updatedUser;
        }
    },
    {
        method: 'PUT',
        path: '/users/{userId}/general',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers', 'UpdateBasicUserInfo']
            },
            validate: {
                params: {
                    userId: Joi.string().guid(),
                },
                payload: {
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;
            const userId = request.params.userId;

            logger.debug(`Editing user: ${userId}`);
            await uow.beginTransaction();

            const userDetail = {
                firstName: payload.firstName,
                lastName: payload.lastName
            };

            const user = await uow.usersRepository.editUser(userDetail, userId);

            await uow.commitTransaction();
            
            return user;
        }
    },
    {
        method: 'POST',
        path: '/users/{userId}/addUserEmails',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers', 'AddEmail']
            },
            validate: {
                params: {
                    userId: Joi.string().guid(),
                },
                payload: {
                    userEmails: Joi.array().items(
                        Joi.object({
                            email: Joi.string().email(),
                            id: Joi.string().guid().allow(null)
                        })
                    ),
                    applicationId: Joi.string().optional().allow(null).allow('')
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;
            const userId = request.params.userId;
            logger.debug(`Editing user emails: ${userId}`);
            await uow.beginTransaction();

            const newOrReusedUserEmails = await uow.userEmailsRepository.addUserEmails(userId, payload.userEmails);

            await uow.commitTransaction();

            if (newOrReusedUserEmails) {
                const promises = newOrReusedUserEmails.map(async userEmail => {
                    return await emailService.sendVerificationEmail(userEmail, uow, request, payload.applicationId)
                });

                Promise.all(promises);
            }
            
            return true;
        }
    },
    {
        method: 'POST',
        path: '/users/{userId}/deleteUserEmails',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers', 'DeleteEmail']
            },
            validate: {
                params: {
                    userId: Joi.string().guid()
                },
                payload: {
                    userEmailIds: Joi.array()
                    .items(
                        Joi.string().guid()
                    ).required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.params.userId;
            const userEmailIds = request.payload.userEmailIds;
            logger.debug(`Editing user emails: ${userId}`);
            await uow.beginTransaction();

            const user = await uow.usersRepository.getUserById(userId);
            if (userEmailIds.includes(user.primaryEmailId)) {
                return httpResponseService.badData(h);
            }

            await uow.userEmailsRepository.deleteUserEmails(userEmailIds, userId);

            await uow.commitTransaction();
            
            return true;
        }
    },
    {
        method: 'PUT',
        path: '/users/{userId}/setPrimaryUserEmail',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers', 'SetPrimaryEmail']
            },
            validate: {
                params: {
                    userId: Joi.string().guid()
                },
                payload: {
                    primaryUserEmailId: Joi.string().guid().required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.params.userId;
            const primaryUserEmailId = request.payload.primaryUserEmailId;
            logger.debug(`Updating primary email for: ${userId}`);
            await uow.beginTransaction();

            const userEmail = await uow.userEmailsRepository.getUserEmailById(primaryUserEmailId);

            await uow.usersRepository.setPrimaryUserEmail(userId, userEmail);

            await uow.commitTransaction();
            
            return true;
        }
    },
    {
        method: 'GET',
        path: '/users/{userId}/organizations',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.params.userId;

            logger.debug(`Fetching all organizations by user: ${userId}`);

            const organizations = await uow.organizationsRepository.getOrganizationsByUser(userId);
            
            return organizations;
        },
        options: {
            validate: {
                params: {
                    userId: Joi.string().guid().required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/users/{userId}/organizations/{organizationId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const {userId, organizationId} = request.params;

            logger.debug(`Fetching organization: ${organizationId} by user: ${userId}`);

            const organization = await uow.organizationsRepository.getOrganizationByIdAndUserId(organizationId, userId);
            
            return organization;
        },
        options: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            validate: {
                params: {
                    userId: Joi.string().guid().required(),
                    organizationId: Joi.string().guid().required()
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/users/{userId}/organizations',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers', 'ManageUserOrganizations']
            },
            validate: {
                params: {
                    userId: Joi.string().guid(),
                },
                payload: {
                    organizationIds: Joi.array()
                    .items(
                        Joi.string().guid()
                    ).optional(),
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;
            const userId = request.params.userId;
            logger.debug(`Editing user organizations: ${userId}`);
            await uow.beginTransaction();

            await uow.usersRepository.replaceUserOrganizationsByUserId(userId, payload.organizationIds);

            await uow.commitTransaction();
            
            return h.continue;
        }
    },
    {
        method: 'PUT',
        path: '/users/{userId}/roles',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers', 'ManageUserRoles']
            },
            validate: {
                params: {
                    userId: Joi.string().guid(),
                },
                payload: {
                    roleIds: Joi.array()
                    .items(
                        Joi.string().guid()
                    ).optional(),
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;
            const userId = request.params.userId;
            logger.debug(`Editing user roles for user: ${userId}`);
            await uow.beginTransaction();

            await uow.usersRepository.replaceUserRoles(userId, payload.roleIds);

            await uow.commitTransaction();
            
            return h.continue;
        }
    },
    {
        method: 'GET',
        path: '/users/{userId}/roles',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.params.userId;
            
            logger.debug(`Fetching user roles for user: ${userId}`);

            const userRoles = await uow.usersRepository.getUserRoles(userId);
            
            return userRoles;
        },
        options: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            validate: {
                params: {
                    userId: Joi.string().guid(),
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/users/{userId}',
        config: {
            plugins: {
                requiredPermissions: ['ViewUsers', 'DeleteUsers']
            },
            validate: {
                params: {
                    userId: Joi.string().uuid().required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.params.userId;

            logger.debug(`Deleting user with id: ${userId}`);

            const result = await uow.usersRepository.deleteUser(userId);
            
            return result;
        }
    }
];