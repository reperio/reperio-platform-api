const Joi = require('joi');
const AuthService = require('./services/authService');
const HttpResponseService = require('./services/httpResponseService');
const EmailService = require('./services/emailService');
const RecaptchaService = require('./services/recaptchaService');

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

                const user = await uow.usersRepository.getUserByEmail(request.payload.primaryEmail);

                if (!user || !authService.validatePassword(request.payload.password, user.password)) {
                    return httpResponseService.unauthorized(h);
                }

                const token = authService.getAuthToken(user, request.server.app.config.jsonSecret, request.server.app.config.jwtValidTimespan);

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
                    primaryEmail: Joi.string().required(),
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
            const emailService = new EmailService();
            const httpResponseService = new HttpResponseService();

            try {
                const signupDetails = request.payload;

                logger.debug(`New account signup, email=${signupDetails.email}`);

                //validate signup details
                if (signupDetails.password !== signupDetails.confirmPassword) {
                    return httpResponseService.badData(h);
                }

                //create org
                const organization = await uow.organizationsRepository.createOrganization(signupDetails.email);
                
                //create user in org
                const password = await authService.hashPassword(signupDetails.password);

                const userDetail = {
                    firstName: signupDetails.firstName,
                    lastName: signupDetails.lastName,
                    primaryEmail: signupDetails.primaryEmail,
                    primaryEmailVerified: false,
                    disabled: false,
                    deleted: false,
                    password: password
                };
                const user = await uow.usersRepository.createUser(userDetail);
                
                //sign the user in
                const token = authService.getAuthToken(user, request.server.app.config.jsonSecret, request.server.app.config.jwtValidTimespan);

                //send email confirmation email
                emailService.sendEmail('', '', '', '');

                return httpResponseService.loginSuccess(h, token);
            } catch (err) {
                logger.error(err);
                throw err;
            }
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    primaryEmail: Joi.string().required(),
                    password: Joi.string().required(),
                    confirmPassword: Joi.string().required()
                }
            }
        }
    },{
        method: 'POST',
        path: '/auth/recaptcha',
        handler: async (request, h) => {
            const recaptcha = await request.app.getNewRecaptcha();
            const logger = request.server.app.logger;
            const payload = request.payload;

            try {
                const response = await recaptcha.siteVerify(request.server.app.config.secret, payload.response, request.info.remoteAddress);
                return response;
            } catch (err) {
                logger.error(err);
                throw err;
            }
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    response: Joi.string().required()
                }
            }
        }
    }
];
