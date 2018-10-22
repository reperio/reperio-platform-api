const Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/organizations',
        config: {
            plugins: {
                requiredPermissions: ['ViewOrganizations', 'CreateOrganizations']
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    userIds: Joi.array()
                        .items(
                            Joi.string()
                        ).required(),
                    personal: Joi.bool().required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Create organization', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;

            try {
                logger.debug(`Creating organization`);
                requestMeta.otherDetails.payload = payload;
                await uow.beginTransaction();

                const organization = await uow.organizationsRepository.createOrganization(payload.name, payload.personal);
                requestMeta.after.organization = organization;
                requestMeta.after.users = [];
                if (organization && payload.userIds.length > 0) {
                    const user = await uow.usersRepository.replaceUserOrganizationsByOrganizationId(organization.id, payload.userIds);
                    requestMeta.after.users.push(user);
                }

                await uow.commitTransaction();
                requestMeta.responseCode = 200;
                await activityLogger.info('Created organization', requestMeta);
                return organization;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Create organization failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'DELETE',
        path: '/organizations/{organizationId}',
        config: {
            plugins: {
                requiredPermissions: ['ViewOrganizations', 'DeleteOrganizations']
            },
            validate: {
                params: {
                    organizationId: Joi.string().uuid().required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Delete organization', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger; 
            const organizationId = request.params.organizationId;

            try {
                logger.debug(`Deleting organization with id: ${organizationId}`);
                requestMeta.otherDetails.organizationId = organizationId;
                requestMeta.before = await uow.organizationsRepository.getOrganizationById(organizationId);
                const result = await uow.organizationsRepository.deleteOrganization(organizationId);
                requestMeta.after = result;
                requestMeta.responseCode = 200;
                await activityLogger.info('Deleted organization', requestMeta);
                return result;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Delete organization failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'GET',
        path: '/organizations',
        config: {
            plugins: {
                requiredPermissions: ['ViewOrganizations']
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch all organizations', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            try {
                logger.debug(`Fetching all organizations`);
                const organizations = await uow.organizationsRepository.getAllOrganizations();
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched all organizations', requestMeta);
                return organizations;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch all organizations failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'GET',
        path: '/organizations/user/{userId}',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetching all organizations for user', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.params.userId;

            try {
                logger.debug(`Fetching all organizations by user: ${userId}`);
                requestMeta.otherDetails.userId = userId;
                const organizations = await uow.organizationsRepository.getOrganizationsByUser(userId);
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched all organizations for user', requestMeta);
                return organizations;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch all organizations for user failed', requestMeta);
                return h.response('server error').code(500);
            }
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
        path: '/organizations/{organizationId}',
        config: {
            plugins: {
                requiredPermissions: ['ViewOrganizations']
            },
            validate: {
                params: {
                    organizationId: Joi.string().uuid().required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch organization by id', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const organizationId = request.params.organizationId;

            try {
                logger.debug(`Fetching organization by organizationId: ${organizationId}`);
                requestMeta.otherDetails.organizationId = organizationId;
                const organization = await uow.organizationsRepository.getOrganizationById(organizationId);
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched organization by id', requestMeta);
                return organization;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch organization by id failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'PUT',
        path: '/organizations/{organizationId}',
        config: {
            plugins: {
                requiredPermissions: ['ViewOrganizations', 'UpdateOrganizations']
            },
            validate: {
                params: {
                    organizationId: Joi.string().guid(),
                },
                payload: {
                    name: Joi.string().required(),
                    userIds: Joi.array()
                        .items(
                            Joi.string()
                        ).required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Update organization', requestMeta);
            
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const organizationId = request.params.organizationId;
            const payload = request.payload;

            try {
                logger.debug(`Updating organization: ${organizationId}`);
                requestMeta.otherDetails.organizationId = organizationId;
                requestMeta.otherDetails.payload = payload;
                await uow.beginTransaction();
                requestMeta.before.organization = await uow.organizationsRepository.getOrganizationById(organizationId);
                const organization = await uow.organizationsRepository.editOrganization(organizationId, payload.name);
                requestMeta.after.organization = organization;
                const result = await uow.usersRepository.replaceUserOrganizationsByOrganizationId(organizationId, payload.userIds);
                requestMeta.before.userOrganizations = result.before;
                requestMeta.after.userOrganizations = result.after;
                await uow.commitTransaction();
                requestMeta.responseCode = 200;
                await activityLogger.info('Updated organization', requestMeta);
                return organization;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Update organization failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    }
];