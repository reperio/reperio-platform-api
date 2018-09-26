const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/applications',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all applications`);

            const apps = await uow.applicationsRepository.getAllApplications();
            
            return apps;
        }
    },
    {
        method: 'GET',
        path: '/applications/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching application by id`);
            const id = request.params.id;

            const app = await uow.applicationsRepository.getApplicationById(id);
            
            return app;
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
        method: 'POST',
        path: '/applications',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Creating application`);
            const payload = request.payload;

            const app = await uow.applicationsRepository.createApplication(payload.name, payload.apiUrl, payload.clientUrl, payload.secretKey);
            
            return app;
        },
        options: {
            validate: {
                payload: {
                    name: Joi.string().required(),
                    apiUrl: Joi.string().required(),
                    clientUrl: Joi.string().required(),
                    secretKey: Joi.string().required()
                }
            }
        }  
    },
    {
        method: 'DELETE',
        path: '/applications/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const id = request.params.id;

            logger.debug(`Deleting application with id: ${id}`);

            const app = await uow.applicationsRepository.deleteApplication(id);
            
            return app;
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