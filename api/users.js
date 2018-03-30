const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/users/{userId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            const userId = request.params.userId;

            logger.debug(`Fetching user ${userId}`);

            const accounts = await uow.usersRepository.getUserById(userId);
            
            return {status: 0, message: 'success', data: accounts};
        },
        options: {
            validate: {
                params: {
                    userId: Joi.string().required()
                }
            }
        }
    }
];

