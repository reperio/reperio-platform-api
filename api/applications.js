const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/applications',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch all applications', requestMeta);
            
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                logger.debug(`Fetching all applications`);
                const apps = await uow.applicationsRepository.getAllApplications();
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched all applications', requestMeta);
                return apps;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch all applications failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'GET',
        path: '/applications/{id}',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch application by id', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                logger.debug(`Fetching application by id`);
                const id = request.params.id;
                requestMeta.otherDetails.applicationId = id;
                const app = await uow.applicationsRepository.getApplicationById(id);
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched application by id', requestMeta);
                return app;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch all applications failed', requestMeta);
                return h.response('server error').code(500);
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Create application', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                logger.debug(`Creating application`);
                const payload = request.payload;

                const app = await uow.applicationsRepository.createApplication(payload.name, payload.apiUrl, payload.clientUrl, payload.secretKey);

                requestMeta.after = payload;
                delete requestMeta.after.secretKey;
                requestMeta.responseCode = 200;
                await activityLogger.info('Created application', requestMeta);
                return app;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Create application failed', requestMeta);
                return h.response('server error').code(500);
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Delete application', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            try {
                const id = request.params.id;
                logger.debug(`Deleting application with id: ${id}`);
                requestMeta.otherDetails.applicationId = id;
                requestMeta.before = await uow.applicationsRepository.getApplicationById(id);
                const app = await uow.applicationsRepository.deleteApplication(id);
                requestMeta.after = app;
                requestMeta.responseCode = 200;
                await activityLogger.info('Deleted application', requestMeta);
                return app;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Delete application failed', requestMeta);
                return h.response('server error').code(500);
            }
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