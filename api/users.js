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

            const emailAddress = request.query.emailAddress.toLowerCase();

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
        method: 'POST',
        path: '/users/query',
        config: {
            auth: {
                strategies: ['jwt', 'application-token'],
            },
            plugins: {
                requiredPermissions: ['ViewUsers']
            },
            validate: {
                payload: {
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
                    ).optional(),
                    organizationId: Joi.string().guid().optional().allow(null).allow(""),
                    userIds: Joi.array().items(Joi.string().guid()).optional().allow(null)
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const {page, pageSize, sort, filter, organizationId, userIds} = request.payload;
            const query = {page, pageSize, sort, filter};

            logger.debug(`Fetching all users with query`);

            let results, total;

            if (userIds && userIds.length) {
                const queryResponse = await uow.usersRepository.getAllUsersByIdsQuery(query, userIds);
                results = queryResponse.results;
                total = queryResponse.total;
            } else {
                const queryResponse = await uow.usersRepository.getAllUsersQuery(query, organizationId);
                results = queryResponse.results;
                total = queryResponse.total;
            }


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
            payload.primaryEmailAddress = payload.primaryEmailAddress.toLowerCase();

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
            const updatedUser = await uow.usersRepository.editUser({primaryEmailId: userEmail.id}, user.id);
            const role = await uow.rolesRepository.createRole('Organization Admin', organization.id);
            const rolePermission = await uow.rolesRepository.updateRolePermissions(role.id, ['UpdateOrganization']);
            const userRole = await uow.usersRepository.addRoles(user.id, [role.id]);
            updatedUser.permissions = permissionService.getUserPermissions(updatedUser);

            await uow.commitTransaction();

            //send verification email
            await emailService.sendVerificationEmail(user.id, user.primaryEmailAddress, uow, request, payload.applicationId);

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
    },
    {
        method: 'POST',
        path: '/users/invite/email',
        config: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            validate: {
                payload: {
                    applicationId: Joi.string().guid().required(),
                    invitingId: Joi.string().guid().required(),
                    primaryEmailAddress: Joi.string().email().max(255).required(),
                    firstName: Joi.string().max(255).optional(),
                    lastName: Joi.string().max(255).optional(),
                    organizationId: Joi.string().guid().required(),
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const {applicationId, invitingId, primaryEmailAddress, firstName, lastName, organizationId} = request.payload;

            try {
                logger.info(`Inviting user email: ${primaryEmailAddress} to organizationId: ${organizationId}`);
                logger.debug(request.payload);

                let invitedUser;
                let existingUser;
                if (firstName && lastName) {
                    const checkUser = await uow.usersRepository.getUserByEmail(primaryEmailAddress);
                    if (checkUser) {
                        return httpResponseService.conflict(h);
                    }
                    existingUser = false;
                    logger.info(`Creating new user email: ${primaryEmailAddress}`);
                    const userModel = {
                        primaryEmailAddress,
                        firstName,
                        lastName,
                        disabled: false,
                        deleted: false,
                        emailVerified: false
                    };
                    invitedUser = await uow.usersRepository.createUser(userModel); 
                } else {
                    logger.info(`Inviting existing user email: ${primaryEmailAddress}`);
                    existingUser = true;
                    invitedUser = await uow.usersRepository.getUserByEmail(primaryEmailAddress);
                    if (!invitedUser.password) {
                        logger.info('User exists in core but has no password, sending new user email');
                        existingUser = false;
                    }
                }

                const invitingUser = await uow.usersRepository.getUserById(invitingId);
                const organization = await uow.organizationsRepository.getOrganizationById(organizationId);

                await emailService.sendInviteEmail(invitedUser, existingUser, invitingUser, organization, applicationId, uow, request);

                return true;
            } catch (err) {
                logger.error(err);
                logger.error(err.message);
                throw err;
            }
        }
    }
];