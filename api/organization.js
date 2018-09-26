const Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/organizations',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;

            logger.debug(`Creating organization`);
            await uow.beginTransaction();

            const organization = await uow.organizationsRepository.createOrganization(payload.name, payload.personal);
            if (organization && payload.userIds.length > 0) {
                await uow.usersRepository.replaceUserOrganizationsByOrganizationId(organization.id, payload.userIds);
            }

            await uow.commitTransaction();
            
            return organization;
        },
        options: {
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
        }  
    },
    {
        method: 'DELETE',
        path: '/organizations/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const id = request.params.id;

            logger.debug(`Deleting organization with id: ${id}`);

            const result = await uow.organizationsRepository.deleteOrganization(id);
            
            return result;
        },
        options: {
            validate: {
                params: {
                    id: Joi.string().uuid().required()
                }
            }
        }  
    },
    {
        method: 'GET',
        path: '/organizations',
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

            logger.debug(`Fetching all organizations by user`);

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
        path: '/organizations/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching organization by id`);
            const id = request.params.id;

            const organization = await uow.organizationsRepository.getOrganizationById(id);
            
            return organization;
        },
        options: {
            validate: {
                params: {
                    id: Joi.string().guid().required()
                }
            }
        }  
    },
    {
        method: 'PUT',
        path: '/organizations/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Updating organization`);
            const id = request.params.id;
            const payload = request.payload;
            await uow.beginTransaction();

            const organization = await uow.organizationsRepository.editOrganization(id, payload.name);
            await uow.usersRepository.replaceUserOrganizationsByOrganizationId(id, payload.userIds);

            await uow.commitTransaction();
            return organization;
        },
        options: {
            validate: {
                params: {
                    id: Joi.string().guid(),
                },
                payload: {
                    name: Joi.string().required(),
                    userIds: Joi.array()
                        .items(
                            Joi.string()
                        ).required()
                }
            }
        }  
    }
];
