const Joi = require('joi');
const AuthService = require('./services/authService');
const HttpResponseService = require('./services/httpResponseService');
const EmailService = require('./services/emailService');
const moment = require('moment');

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

                const user = await uow.usersRepository.getUserByEmail(request.payload.primaryEmailAddress);

                if (!user || !authService.validatePassword(request.payload.password, user.password)) {
                    return httpResponseService.unauthorized(h);
                }

                user.password = null;

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
                    primaryEmailAddress: Joi.string().required(),
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

                logger.debug(`New account signup, email=${signupDetails.primaryEmailAddress}`);

                //validate signup details
                if (signupDetails.password !== signupDetails.confirmPassword) {
                    return httpResponseService.badData(h);
                }

                await uow.beginTransaction();

                const existingUser = await uow.usersRepository.getUserByEmail(signupDetails.primaryEmailAddress);
                if (existingUser != null) {
                    return httpResponseService.conflict(h);
                }

                //create org
                const organization = await uow.organizationsRepository.createOrganization(signupDetails.primaryEmailAddress, true);
                
                const password = await authService.hashPassword(signupDetails.password);

                const userModel = {
                    firstName: signupDetails.firstName,
                    primaryEmailAddress: signupDetails.primaryEmailAddress,
                    lastName: signupDetails.lastName,
                    password,
                    disabled: false,
                    deleted: false
                };
                
                const user = await uow.usersRepository.createUser(userModel, [organization.id]);
                const userEmail = await uow.userEmailsRepository.createUserEmail(user.id, signupDetails.primaryEmailAddress);
                const updatedUser = await uow.usersRepository.editUser({primaryEmailId: userEmail.id}, user.id);
                updatedUser.password = null;

                //sign the user in
                const token = authService.getAuthToken(updatedUser, request.server.app.config.jsonSecret, request.server.app.config.jwtValidTimespan);

                await uow.commitTransaction();

                //send verification email
                await emailService.sendVerificationEmail(userEmail, uow, request);

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
                    primaryEmailAddress: Joi.string().required(),
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
    }, {
        method: 'POST',
        path: '/auth/emailVerification',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;
            const entry = await uow.emailVerificationsRepository.getEntry(payload.token);
            if (entry && !entry.triggeredAt) {
                const now = moment.utc();
                await uow.emailVerificationsRepository.trigger(payload.token, now.format());
                logger.debug(`Email verification`);
                if (now.diff(entry.createdAt, 'minutes') >= request.server.app.config.email.linkTimeout) {
                    logger.debug(`Link expired`);
                    return false;
                }
                else {
                    await uow.usersRepository.verifyUserEmail(entry.userEmailId);
                    logger.debug(`Email verification successful`);
                    return true;
                }
            }
            return false;
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    token: Joi.string().guid().required()
                }
            }
        }
    },{
        method: 'POST',
        path: '/auth/forgotPassword',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const emailService = new EmailService();
            const logger = request.server.app.logger;
            const payload = request.payload;

            const existingUser = await uow.usersRepository.getUserByEmail(payload.primaryEmailAddress);
            if (existingUser == null) {
                return httpResponseService.badData(h);
            }

            const userEmail = await uow.userEmailsRepository.getUserEmail(existingUser.id, payload.primaryEmailAddress);

            if (userEmail == null) {
                return httpResponseService.badData(h);
            }

            logger.debug(`Sending reset password email to user: ${existingUser.id}`);

            await emailService.sendForgotPasswordEmail(userEmail, uow, request);

            return true;
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    primaryEmailAddress: Joi.string().required()
                }
            }
        }
    },{
        method: 'GET',
        path: '/auth/resetPassword/{token}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const entry = await uow.forgotPasswordsRepository.getEntry(request.params.token);
            
            if (entry && !entry.triggeredAt) {
                const now = moment.utc();

                if (now.diff(entry.createdAt, 'minutes') >= request.server.app.config.email.linkTimeout) {
                    logger.debug(`Link expired`);
                    return false;
                }
                else {
                    return true;
                }
            }
            return false;
        },
        options: {
            auth: false,
            validate: {
                params: {
                    token: Joi.string().guid().required(),
                }
            }
        }
    },{
        method: 'POST',
        path: '/auth/resetPassword',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const httpResponseService = new HttpResponseService();
            const authService = new AuthService();
            const logger = request.server.app.logger;
            const payload = request.payload;
            const entry = await uow.forgotPasswordsRepository.getEntry(payload.token);
            
            if (entry && !entry.triggeredAt) {
                const now = moment.utc();

                logger.debug(`Forgot password`);

                if (payload.password != payload.confirmPassword) {
                    logger.debug(`Passwords don't match`);
                    return httpResponseService.badData(h);
                }

                await uow.forgotPasswordsRepository.trigger(payload.token, now.format());

                if (now.diff(entry.createdAt, 'minutes') >= request.server.app.config.email.linkTimeout) {
                    logger.debug(`Link expired`);
                    return false;
                }
                else {
                    const password = await authService.hashPassword(payload.password);
                    await uow.usersRepository.editUser({password}, entry.userId);
                    logger.debug(`Forgot password successful`);
                    return true;
                }
            }
            return false;
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    token: Joi.string().guid().required(),
                    password: Joi.string().required(),
                    confirmPassword: Joi.string().required()
                }
            }
        }
    }
];