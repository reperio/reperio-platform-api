const Joi = require('joi');
const HttpResponseService = require('./services/httpResponseService');
const EmailService = require('./services/emailService');
const AuthService = require('./services/authService');

module.exports = [
    {
        method: 'GET',
        path: '/users/{userId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            const userId = request.params.userId;

            logger.debug(`Fetching user ${userId}`);

            const user = await uow.usersRepository.getUserById(userId);
            user.password = null;
            
            return user;
        },
        options: {
            validate: {
                params: {
                    userId: Joi.string().uuid().required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/users',
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
        path: '/users',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const httpResponseService = new HttpResponseService();
            const emailService = new EmailService();
            const authService = new AuthService();

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

            const organization = await uow.organizationsRepository.createOrganization(userModel.primaryEmailAddress, true);
            const user = await uow.usersRepository.createUser(userModel, payload.organizationIds.concat(organization.id));
            const userEmail = await uow.userEmailsRepository.createUserEmail(user.id, user.primaryEmailAddress);
            const updatedUser = await uow.usersRepository.editUser({primaryEmailId: userEmail.id}, user.id);

            await uow.commitTransaction();

            //send verification email
            await emailService.sendVerificationEmail(userEmail, uow, request);

            return updatedUser;
        },
        options: {
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
        }
    },
    {
        method: 'PUT',
        path: '/users/{userId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;
            const userId = request.params.userId;
            logger.debug(`Editing user: ${userId}`);
            await uow.beginTransaction();

            const existingUser = await uow.usersRepository.getUserById(userId);

            const userDetail = {
                firstName: payload.firstName,
                lastName: payload.lastName,
                disabled: existingUser.disabled,
                deleted: existingUser.deleted,
                primaryEmailAddress: payload.primaryEmailAddress
            };

            await uow.userEmailsRepository.editUserEmails(userId, payload.userEmails);

            const user = await uow.usersRepository.editUser(userDetail, userId);
            await uow.usersRepository.replaceUserOrganizationsByUserId(userId, payload.organizationIds);
            await uow.usersRepository.replaceUserRoles(userId, payload.roleIds);

            await uow.commitTransaction();
            
            return user;
        },
        options: {
            validate: {
                params: {
                    userId: Joi.string().guid(),
                },
                payload: {
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    organizationIds: Joi.array()
                    .items(
                        Joi.string().guid()
                    ).optional(),
                    roleIds: Joi.array()
                    .items(
                        Joi.string().guid()
                    ).optional(),
                    userEmails: Joi.array().items(
                        Joi.object({
                            email: Joi.string().email(),
                            id: Joi.string().guid().optional()
                        })
                    ),
                    primaryEmailAddress: Joi.string().required()
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/users/{userId}/roles',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.params.userId;
            const roleIds = request.payload.roleIds;
            logger.debug(`Updating user roles for user: ${userId}`);

            await uow.beginTransaction();
            const userRoles = await uow.usersRepository.updateRoles(userId, roleIds);
            await uow.commitTransaction();
            
            return userRoles;
        },
        options: {
            validate: {
                params: {
                    userId: Joi.string().guid(),
                },
                payload: {
                    roleIds: Joi.array()
                        .items(
                            Joi.string()
                        ).min(1).required()
                }
            }
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
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.params.userId;

            logger.debug(`Deleting user with id: ${userId}`);

            const result = await uow.usersRepository.deleteUser(userId);
            
            return result;
        },
        options: {
            validate: {
                params: {
                    userId: Joi.string().uuid().required()
                }
            }
        }  
    }
];