const Joi = require('joi');
const AuthService = require('./services/authService');
const HttpResponseService = require('./services/httpResponseService');
const EmailService = require('./services/emailService');

module.exports = [
    {
        method: 'POST',
        path: '/auth/login',
        handler: async (request, h) => {
            const logger = request.server.app.logger;
            const authService = new AuthService();
            const httpResponseService = new HttpResponseService();
            
            try {
                logger.debug(`Auth/Login - ${JSON.stringify(request.payload)}`);
                const uow = await request.app.getNewUoW();

                const user = await uow.usersRepository.getUserByEmail(request.payload.email);

                if (!user || !authService.validatePassword(request.payload.password, user.password)) {
                    return httpResponseService.unauthorized(h);
                }

                const token = authService.getAuthToken(user, request.server.app.config.jsonSecret);

                return httpResponseService.loginSuccess(h, token);
            } catch (err) {
                logger.error(err);
                return httpResponseService.unauthorized(h);
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
    },{
        method: 'POST',
        path: '/auth/signup',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const authService = new AuthService();
            const httpResponseService = new HttpResponseService();

            try {
                const signupDetails = request.payload;

                logger.debug(`New account signup, organization=${signupDetails.organization} email=${signupDetails.email}`);

                //validate signup details
                

                //create org
                const organization = await uow.organizationsRepository.createOrganization(signupDetails.organization);
                
                //create user in org
                const password = authService.hashPassword(signupDetails.password);

                const userDetail = {
                    firstName: signupDetails.firstName,
                    lastName: signupDetails.lastName,
                    email: signupDetails.email,
                    password: password,
                    organizationId: organization.id
                };
                const user = await uow.usersRepository.createUser(userDetail);
                
                //sign the user in
                const token = authService.getAuthToken(user, request.server.app.config.jsonSecret);

                //send email confirmation email
                EmailService.sendEmail('', '', '', '');

                return httpResponseService.loginSuccess(h, token);
            } catch (err) {
                logger.error(err);
                throw err;
            }
        },
        options: {
            validate: {
                payload: {
                    firstName: Joi.string().required(),
                    lasttName: Joi.string().required(),
                    email: Joi.string().required(),
                    password: Joi.string().required(),
                    confirmPassword: Joi.string().required()
                }
            }
        }
    }
];
