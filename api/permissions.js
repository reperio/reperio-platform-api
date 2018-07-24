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
            //auth: false
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

            //const permission = await uow.permissionsRepository.getPermissionById(id);
            
            return null;
        },
        options: {
        //auth: false,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                }
            }
        }  
    }
];