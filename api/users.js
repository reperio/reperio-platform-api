const Joi = require('joi');
const HttpResponseService = require('./services/httpResponseService');
const EmailService = require('./services/emailService');
const AuthService = require('./services/authService');
const PermissionService = require('./services/permissionService');

module.exports = [
    {
        method: 'GET',
        path: '/users/{userId}',
        config: {
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetching user', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {

                const userId = request.params.userId;
                requestMeta.otherDetails.userId = userId;
                logger.debug(`Fetching user ${userId}`);

                const user = await uow.usersRepository.getUserById(userId);
                user.permissions = PermissionService.getUserPermissions(user);
                user.password = null;

                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched user', requestMeta);
                
                return user;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to fetch user', requestMeta);
                return h.response('server error').code(500);
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetching all users', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                logger.debug(`Fetching all users`);

                const users = await uow.usersRepository.getAllUsers();

                users.forEach(x => x.password = null);

                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched all users', requestMeta);

                return users;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to fetch users', requestMeta);
                return h.response('server error').code(500);
            }
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
                    ).optional()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Creating user', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const httpResponseService = new HttpResponseService();
            const emailService = new EmailService();
            const authService = new AuthService();

            try {
                logger.debug(`Creating user`);
                const payload = request.payload;
                requestMeta.otherDetails.payload = payload;
                delete requestMeta.otherDetails.payload.password;
                delete requestMeta.otherDetails.payload.confirmPassword;

                //validate signup details
                if (payload.password !== payload.confirmPassword) {
                    requestMeta.otherDetails.error = 'Passwords do not match';
                    requestMeta.responseCode = 400;
                    await activityLogger.warn('Failed to create user');
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
                    requestMeta.otherDetails.error = 'User with given email already exists';
                    requestMeta.responseCode = 409;
                    await activityLogger.warn('Failed to create user');
                    return httpResponseService.conflict(h);
                }

                const organization = await uow.organizationsRepository.createOrganization(userModel.primaryEmailAddress, true);
                const user = await uow.usersRepository.createUser(userModel, payload.organizationIds.concat(organization.id));
                const userEmail = await uow.userEmailsRepository.createUserEmail(user.id, user.primaryEmailAddress);
                const updatedUser = await uow.usersRepository.editUser({primaryEmailId: userEmail.id}, user.id);
                updatedUser.permissions = PermissionService.getUserPermissions(updatedUser);

                await uow.commitTransaction();

                //send verification email
                await emailService.sendVerificationEmail(userEmail, uow, request, requestMeta);

                requestMeta.after = {
                    user: updatedUser,
                    organization: organization,
                    userEmail: userEmail
                };
                requestMeta.responseCode = 200;
                await activityLogger.info('Created user');

                return updatedUser;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to create user', requestMeta);
                return h.response('server error').code(500);
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Updating user', requestMeta);
            
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                const payload = request.payload;
                const userId = request.params.userId;

                requestMeta.otherDetails.userId = userId;
                requestMeta.otherDetails.payload = payload;
                requestMeta.before = await uow.usersRepository.getUserById(userId);
                delete requestMeta.before.password;

                logger.debug(`Editing user: ${userId}`);
                await uow.beginTransaction();
                const userDetail = {
                    firstName: payload.firstName,
                    lastName: payload.lastName
                };
                const user = await uow.usersRepository.editUser(userDetail, userId);
                await uow.commitTransaction();

                requestMeta.after = user;
                delete requestMeta.after.password;
                requestMeta.responseCode = 200;
                await activityLogger.info('Updated user', requestMeta);

                return user;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to update user', requestMeta);
                return h.response('server error').code(500);
            }
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
                    )
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Adding user emails', requestMeta);

            const uow = await request.app.getNewUoW();
            const emailService = new EmailService();
            const logger = request.server.app.logger;

            try {
                const payload = request.payload;
                const userId = request.params.userId;
                requestMeta.otherDetails.userId = userId;
                requestMeta.otherDetails.payload = payload;

                logger.debug(`Editing user emails: ${userId}`);
                await uow.beginTransaction();

                requestMeta.before = await uow.userEmailsRepository.getAllUserEmailsByUserId(userId);
                const newOrReusedUserEmails = await uow.userEmailsRepository.addUserEmails(userId, payload.userEmails);
    
                await uow.commitTransaction();
    
                if (newOrReusedUserEmails) {
                    const promises = newOrReusedUserEmails.map(async userEmail => {
                        return await emailService.sendVerificationEmail(userEmail, uow, request, requestMeta)
                    });
    
                    Promise.all(promises);
                }

                requestMeta.after = await uow.userEmailsRepository.getAllUserEmailsByUserId(userId);
                requestMeta.responseCode = 200;
                await activityLogger.info('Added user emails', requestMeta);

                return true;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to add user emails', requestMeta);
                return h.response('server error').code(500);
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Deleting user emails', requestMeta);

            const uow = await request.app.getNewUoW();
            const httpResponseService = new HttpResponseService();
            const logger = request.server.app.logger;

            try {
                const userId = request.params.userId;
                const userEmailIds = request.payload.userEmailIds;
                requestMeta.otherDetails.userId = userId;
                requestMeta.otherDetails.payload = request.payload;

                logger.debug(`Editing user emails: ${userId}`);
                await uow.beginTransaction();

                const user = await uow.usersRepository.getUserById(userId);
                if (userEmailIds.includes(user.primaryEmailId)) {
                    requestMeta.otherDetails.error = 'Cannot delete primary email';
                    requestMeta.responseCode = 400;
                    await activityLogger.warn('Failed to delete user emails', requestMeta);
                    return httpResponseService.badData(h);
                }

                requestMeta.before = await uow.userEmailsRepository.getAllUserEmailsByUserId(userId);
                await uow.userEmailsRepository.deleteUserEmails(userEmailIds, userId);
                await uow.commitTransaction();
                requestMeta.after = await uow.userEmailsRepository.getAllUserEmailsByUserId(userId);

                requestMeta.responseCode = 200;
                await activityLogger.info('Deleted user emails', requestMeta);
                
                return true;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to delete user emails', requestMeta);
                return h.response('server error').code(500);
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Setting user primary email', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            try {
                const userId = request.params.userId;
                const primaryUserEmailId = request.payload.primaryUserEmailId;

                requestMeta.otherDetails.userId = userId;
                requestMeta.otherDetails.payload = request.payload;

                logger.debug(`Updating primary email for: ${userId}`);
                await uow.beginTransaction();

                const userEmail = await uow.userEmailsRepository.getUserEmailById(primaryUserEmailId);

                requestMeta.before = await uow.usersRepository.getUserById(userId);
                await uow.usersRepository.setPrimaryUserEmail(userId, userEmail);
                requestMeta.after = await uow.usersRepository.getUserById(userId);

                requestMeta.responseCode = 200;
                await activityLogger.info('Set user primary email', requestMeta);

                await uow.commitTransaction();
                
                return true;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to set user primary email', requestMeta);
                return h.response('server error').code(500);
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Updating user organizations', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                const payload = request.payload;
                const userId = request.params.userId;
                requestMeta.otherDetails.userId = userId;
                requestMeta.otherDetails.payload = payload;

                logger.debug(`Editing user organizations: ${userId}`);
                await uow.beginTransaction();

                const result = await uow.usersRepository.replaceUserOrganizationsByUserId(userId, payload.organizationIds);

                await uow.commitTransaction();

                requestMeta.before = result.before;
                requestMeta.after = result.after;
                requestMeta.responseCode = 200;
                await activityLogger.info('Updated user organizations', requestMeta);
                
                return h.continue;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to update user organizations', requestMeta);
                return h.response('server error').code(500);
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Updating user roles', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                const payload = request.payload;
                const userId = request.params.userId;
                requestMeta.otherDetails.userId = userId;
                requestMeta.otherDetails.payload = payload;
                logger.debug(`Editing user roles for user: ${userId}`);
                await uow.beginTransaction();

                const result = await uow.usersRepository.replaceUserRoles(userId, payload.roleIds);

                await uow.commitTransaction();

                requestMeta.before = result.before;
                requestMeta.after = result.after;
                requestMeta.responseCode = 200;
                await activityLogger.info('Updated user roles', requestMeta);
                
                return h.continue;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to update user roles', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'GET',
        path: '/users/{userId}/roles',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch roles for user', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                const userId = request.params.userId;
                requestMeta.otherDetails.userId = userId;
                
                logger.debug(`Fetching user roles for user: ${userId}`);

                const userRoles = await uow.usersRepository.getUserRoles(userId);
                
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched roles for user', requestMeta);

                return userRoles;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to delete user', requestMeta);
                return h.response('server error').code(500);
            }
        },
        options: {
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Deleting user by id', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                const userId = request.params.userId;
                requestMeta.otherDetails.userId = userId;
                requestMeta.before = await uow.usersRepository.getUserById(userId);

                logger.debug(`Deleting user with id: ${userId}`);

                const result = await uow.usersRepository.deleteUser(userId);

                requestMeta.after = result;
                requestMeta.responseCode = 200;
                await activityLogger.info('Deleted user', requestMeta);
                
                return result;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Failed to delete user', requestMeta);
                return h.response('server error').code(500);
            }
        }
    }
];