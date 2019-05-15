const Joi = require('joi');
const httpResponseService = require('./services/httpResponseService');

module.exports = [
    {
        method: 'POST',
        path: '/organizations',
        options: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    userIds: Joi.array()
                        .items(
                            Joi.string()
                        ).required(),
                    personal: Joi.bool().required(),
                    address: Joi.object({
                        'streetAddress': Joi.string().required(),
                        'suiteNumber': Joi.string().required().allow(''),
                        'city': Joi.string().required(),
                        'state': Joi.string().required(),
                        'zip': Joi.string().required()
                    }).optional()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;

            logger.debug(`Creating organization`);
            await uow.beginTransaction();

            if(payload.address != null){
                const organizationModel = {
                    name: payload.name,
                    ...payload.address
                };

                const existingOrganization = await uow.organizationsRepository.getOrganizationByOrganizationInformation(organizationModel);

                if (existingOrganization == null) {
                    logger.debug(`Creating the organization ${organizationModel.name}`);
                    const dbOrganization = await uow.organizationsRepository.createOrganizationWithAddress(organizationModel);

                    await uow.commitTransaction();
                    return dbOrganization;
                }
                else{
                    return httpResponseService.conflict(h);
                }
            }
            else {
                const organization = await uow.organizationsRepository.createOrganization(payload.name, payload.personal);
                if (organization && payload.userIds.length > 0) {
                    await uow.usersRepository.replaceUserOrganizationsByOrganizationId(organization.id, payload.userIds);
                }

                await uow.commitTransaction();

                return organization;
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const organizationId = request.params.organizationId;

            logger.debug(`Deleting organization with id: ${organizationId}`);

            const result = await uow.organizationsRepository.deleteOrganization(organizationId);
            
            return result;
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all organizations`);

            const organizations = await uow.organizationsRepository.getAllOrganizations();
            
            return organizations;
        }
    },
    {
        method: 'GET',
        path: '/organizations/user/{userId}',
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const organizationId = request.params.organizationId;

            logger.debug(`Fetching organization by organizationId: ${organizationId}`);

            const organization = await uow.organizationsRepository.getOrganizationById(organizationId);
            if (organization.userOrganizations && organization.userOrganizations.length > 0) {
                organization.userOrganizations.forEach(userOrganization => userOrganization.user.password = null)
            }
            
            return organization;
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const organizationId = request.params.organizationId;
            const payload = request.payload;
            
            logger.debug(`Updating organization: ${organizationId}`);

            await uow.beginTransaction();

            const organization = await uow.organizationsRepository.editOrganization(organizationId, payload.name);
            await uow.usersRepository.replaceUserOrganizationsByOrganizationId(organizationId, payload.userIds);

            await uow.commitTransaction();
            return organization;
        }
    },
];