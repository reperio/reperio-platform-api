const Joi = require('joi');
const AuthService = require('./services/authService');
const HttpResponseService = require('./services/httpResponseService');

module.exports = [
    {
        method: 'GET',
        path: '/organizations/signup',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            try {
                const signupDetails = request.payload;

                logger.debug(`New account signup, organization=${signupDetails.organization} email=${signupDetails.email}`);

                //validate signup details
                

                //create org
                const organization = await uow.organizationsRepository.createOrganization(signupDetails.organization);
                
                //create user in org
                const user = await uow.usersRepository.createUser(signupDetails.email, organization.id);
                
                //sign the user in
                const token = AuthService.getAuthToken(user, request.server.app.config.jsonSecret);

                return HttpResponseService.loginSuccess(h, token);
            } catch (err) {
                logger.error(err);
                throw err;
            }
        },
        options: {
            validate: {
                payload: {
                    organization: Joi.string().required(),
                    email: Joi.string().required(),
                    password: Joi.string().required(),
                    confirmPassword: Joi.string().required()
                }
            }
        }
    }
];

