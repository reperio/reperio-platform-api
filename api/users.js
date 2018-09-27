const Joi = require('joi');
const HttpResponseService = require('./services/httpResponseService');
const EmailService = require('./services/emailService');

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

            logger.debug(`Creating user`);
            const payload = request.payload;

            //validate signup details
            if (payload.password !== payload.confirmPassword) {
                return httpResponseService.badData(h);
            }

            const userModel = {
                firstName: payload.firstName,
                lastName: payload.lastName,
                password: payload.password,
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

            logger.debug(`Editing user`);
            const payload = request.payload;
            await uow.beginTransaction();

            const existingUser = await uow.usersRepository.getUserById(request.params.userId);

            const userDetail = {
                firstName: payload.firstName,
                lastName: payload.lastName,
                disabled: existingUser.disabled,
                deleted: existingUser.deleted
            };

            const user = await uow.usersRepository.editUser(userDetail, request.params.userId);
            await uow.usersRepository.replaceUserOrganizationsByUserId(request.params.userId, payload.organizationIds);
            await uow.usersRepository.replaceUserRoles(request.params.userId, payload.roleIds);

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
                    ).optional()
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

            logger.debug(`Updating user roles`);
            const userId = request.params.userId;
            const roleIds = request.payload.roleIds;

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

            logger.debug(`Fetching user roles`);
            const userId = request.params.userId;

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
        path: '/users/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const id = request.params.id;

            logger.debug(`Deleting user with id: ${id}`);

            const result = await uow.usersRepository.deleteUser(id);
            
            return result;
        },
        options: {
            validate: {
                params: {
                    id: Joi.string().uuid().required()
                }
            }
        }  
    }
];