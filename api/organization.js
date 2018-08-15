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

            const result = await uow.organizationsRepository.createOrganization(payload.name, payload.personal);
            
            return result;
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    name: Joi.string().uuid().required(),
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
            auth: false,
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
        },
        options: {
            auth: false
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
            auth: false,
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
            auth: false,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                }
            }
        }  
    }
];
