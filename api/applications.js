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
        },
        options: {
            auth: false
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
        path: '/applications',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Creating application`);
            const payload = request.payload;

            const app = await uow.applicationsRepository.createApplication(payload.name, payload.description, payload.baseUrl);
            
            return app;
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    name: Joi.string().required(),
                    description: Joi.string(),
                    baseUrl: Joi.string().required()
                }
            }
        }  
    }
];