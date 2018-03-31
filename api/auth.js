const Joi = require('joi');
const AuthService = require('./services/authService');
const HttpResponseService = require('./services/httpResponseService');

module.exports = [
    {
        method: 'POST',
        path: '/auth/login',
        handler: async (request, h) => {
            const logger = request.server.app.logger;
            try {
                logger.debug(`Auth/Login - ${JSON.stringify(request.payload)}`);
                const uow = await request.app.getNewUoW();

                const user = await uow.usersRepository.getUserByEmail(request.payload.email);

                if (!user || !AuthService.validatePassword(request.payload.password, user.password)) {
                    return HttpResponseService.unauthorized(h);
                }

                const token = AuthService.getAuthToken(user, request.server.app.config.jsonSecret);

                return HttpResponseService.loginSuccess(h, token);
            } catch (err) {
                logger.error(err);
                return HttpResponseService.unauthorized(h);
            }
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    email: Joi.string().required(),
                    password: Joi.string().required()
                }
            }
        }
    }
];
