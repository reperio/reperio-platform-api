const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/permissions',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all permissions`);

            const permissions = await uow.permissionsRepository.getAllPermissions();
            
            return permissions;
        },
        options: {
            auth: false
        }
    },
    {
        method: 'GET',
        path: '/permissions/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching permission by id`);
            const id = request.params.id;

            const permission = await uow.permissionsRepository.getPermissionById(id);
            
            return permission;
        },
        options: {
            auth: false,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                }
            }
        }  
    },
    {
        method: 'POST',
        path: '/permissions',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Creating permission`);
            const payload = request.payload;

            const permission = await uow.permissionsRepository.createPermission(payload.name, payload.description, payload.applicationId);
            
            return permission;
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    name: Joi.string().required(),
                    description: Joi.string().required(),
                    applicationId: Joi.string().guid().optional()
                }
            }
        }  
    }
];