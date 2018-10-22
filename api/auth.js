const Joi = require('joi');
const AuthService = require('./services/authService');
const HttpResponseService = require('./services/httpResponseService');
const EmailService = require('./services/emailService');
const moment = require('moment');

const uuid4 = require("uuid/v4");

module.exports = [
    {
        method: 'POST',
        path: '/auth/login',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Login', requestMeta);
            
            const logger = request.server.app.logger;
            const authService = new AuthService();
            const httpResponseService = new HttpResponseService();
            
            try {
                const payload = request.payload;
                requestMeta.otherDetails.email = payload.primaryEmailAddress;
                logger.debug(`Login attempt for email: ${payload.primaryEmailAddress}`);
                const uow = await request.app.getNewUoW();

                const user = await uow.usersRepository.getUserByEmail(payload.primaryEmailAddress);

                if (!user || !(await authService.validatePassword(payload.password, user.password))) {
                    requestMeta.responseCode = 401;
                    if (user == null) {
                        requestMeta.otherDetails.error = 'No user with email';
                        await activityLogger.warn('Login failed', requestMeta);
                    } else {
                        requestMeta.userId = user.id;
                        requestMeta.otherDetails.error = 'Invalid password';
                        await activityLogger.warn('Login failed', requestMeta);
                    }
                    return httpResponseService.unauthorized(h);
                }
                user.password = null;
                const token = authService.getAuthToken(user, request.server.app.config.jsonSecret, request.server.app.config.jwtValidTimespan);

                requestMeta.userId = user.id;
                requestMeta.responseCode = 200;
                await activityLogger.info('Logged in', requestMeta);
                
                return httpResponseService.loginSuccess(h, token);
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Login failed', requestMeta);
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
    },
    {
        method: 'POST',
        path: '/auth/otp',
        handler: async (request, h) => {
            const {otp} = request.payload;
            const redisHelper = await request.app.getNewRedisHelper();
            const httpResponseService = new HttpResponseService();
            const token = await redisHelper.getJWTForOTP(otp);

            if (token == null) {
                return httpResponseService.unauthorized(h);
            } else {
                return httpResponseService.loginSuccess(h, token);
            }
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    otp: Joi.string().required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/auth/otp/generate',
        handler: async (request, h) => {
            const otp = uuid4();
            const redisHelper = await request.app.getNewRedisHelper();
            await redisHelper.addOTP(otp, request.auth.token);
            return {otp};
        }
    },{
        method: 'POST',
        path: '/auth/signup',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Sign up', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const authService = new AuthService();
            const emailService = new EmailService();
            const httpResponseService = new HttpResponseService();

            try {
                requestMeta.otherDetails.payload = request.payload;
                delete requestMeta.requestBody.password;
                delete requestMeta.requestBody.password;

                const payload = request.payload;

                logger.debug(`New account signup with email: ${payload.primaryEmailAddress}`);

                //validate signup details
                if (payload.password !== payload.confirmPassword) {
                    requestMeta.otherDetails.error = 'Passwords did not match';
                    requestMeta.responseCode = 400;
                    await activityLogger.warn('Sign up failed', requestMeta);
                    return httpResponseService.badData(h);
                }

                await uow.beginTransaction();

                const existingUser = await uow.usersRepository.getUserByEmail(payload.primaryEmailAddress);
                if (existingUser != null) {
                    requestMeta.otherDetails.error = 'User does not exist';
                    requestMeta.responseCode = 409;
                    await activityLogger.warn('Sign up failed', requestMeta);
                    return httpResponseService.conflict(h);
                }

                //create org
                const organization = await uow.organizationsRepository.createOrganization(payload.primaryEmailAddress, true);
                
                const password = await authService.hashPassword(payload.password);

                const userModel = {
                    firstName: payload.firstName,
                    primaryEmailAddress: payload.primaryEmailAddress,
                    lastName: payload.lastName,
                    password,
                    disabled: false,
                    deleted: false
                };
                
                const user = await uow.usersRepository.createUser(userModel, [organization.id]);
                const userEmail = await uow.userEmailsRepository.createUserEmail(user.id, payload.primaryEmailAddress);
                const updatedUser = await uow.usersRepository.editUser({primaryEmailId: userEmail.id}, user.id);
                updatedUser.password = null;

                //sign the user in
                const token = authService.getAuthToken(updatedUser, request.server.app.config.jsonSecret, request.server.app.config.jwtValidTimespan);

                await uow.commitTransaction();

                requestMeta.userId = user.id;
                requestMeta.after = {user, userEmail, organization};
                delete requestMeta.after.user.password;

                //send verification email
                request.app.requestMeta = requestMeta;
                await emailService.sendVerificationEmail(userEmail, uow, request, requestMeta);

                await activityLogger.info('Signed up', request.app.requestMeta);
                requestMeta.responseCode = 200;
                return httpResponseService.loginSuccess(h, token);
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 200;
                await activityLogger.error('Sign up failed', requestMeta);
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
    },
    {
        method: 'POST',
        path: '/auth/sendVerificationEmail',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Verification email', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const emailService = new EmailService();
            const httpResponseService = new HttpResponseService();
            const payload = request.payload;
            requestMeta.userId = payload.userId;
            requestMeta.otherDetails.email = payload.email;
            logger.debug(`Ssending verification email for user: ${payload.userId}`);
            try {
                await uow.beginTransaction();
                const userEmail = await uow.userEmailsRepository.getUserEmail(payload.userId, payload.email);
                if (userEmail == null) {
                    requestMeta.otherDetails.error = 'Email does not exist for given user';
                    requestMeta.responseCode = 400;
                    await activityLogger.warn('Verfication email failed', requestMeta);
                    return httpResponseService.badData(h);
                }

                //send verification email
                request.app.requestMeta = requestMeta;
                const response = await emailService.sendVerificationEmail(userEmail, uow, request, requestMeta);
                await uow.commitTransaction();
                requestMeta.responseCode = 200;
                await activityLogger.info('Sent verification email', request.app.requestMeta);

                return response;
            } catch (err) {
                logger.error(err);
                requestMeta.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Verification email failed', requestMeta);
                throw err;
            }
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    email: Joi.string().required(),
                    userId: Joi.string().guid().required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/auth/recaptcha',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('New recaptcha request', requestMeta);

            const recaptcha = await request.app.getNewRecaptcha();
            const logger = request.server.app.logger;
            const payload = request.payload;

            try {
                const response = await recaptcha.siteVerify(request.server.app.config.secret, payload.response, request.info.remoteAddress);
                requestMeta.responseCode = 200;
                await activityLogger.info('Recaptcha request successfully processed', requestMeta);
                return response;
            } catch (err) {
                logger.error(err);
                requestMeta.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Recaptcha request failed with error', requestMeta);
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Verify email', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;
            try {
                const entry = await uow.emailVerificationsRepository.getEntry(payload.token);
                if (entry && !entry.triggeredAt) {
                    const now = moment.utc();
                    await uow.emailVerificationsRepository.trigger(payload.token, now.format());
                    logger.debug(`Email verification`);
                    if (now.diff(entry.createdAt, 'minutes') >= request.server.app.config.email.linkTimeout) {
                        logger.debug(`Link expired`);
                        requestMeta.otherDetails.error = 'Link expired';
                        requestMeta.responseCode = 200;
                        await activityLogger.warn('Verify email failed', requestMeta);
                        return false;
                    }
                    else {
                        requestMeta.before = await uow.userEmailsRepository.getUserEmail(entry.userEmailId);
                        const result = await uow.usersRepository.verifyUserEmail(entry.userEmailId);
                        requestMeta.after = result;
                        logger.debug(`Email verification successful`);
                        requestMeta.responseCode = 200;
                        await activityLogger.info('Verified email', requestMeta);
                        return true;
                    }
                }
                return false;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Verify email failed', requestMeta);
                return false;
            }   
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Reset password email', requestMeta);

            const uow = await request.app.getNewUoW();
            const emailService = new EmailService();
            const httpResponseService = new HttpResponseService();
            const logger = request.server.app.logger;
            const payload = request.payload;

            try {
                const existingUser = await uow.usersRepository.getUserByEmail(payload.primaryEmailAddress);
                if (existingUser == null) {
                    requestMeta.otherDetails.error = 'User does not exist';
                    requestMeta.responseCode = 400;
                    await activityLogger.warn('Reset password email failed', requestMeta);
                    return httpResponseService.badData(h);
                }

                requestMeta.otherDetails.userId = existingUser.id;
                logger.debug(`Password reset is requested from user: ${existingUser.id}`);

                const userEmail = await uow.userEmailsRepository.getUserEmail(existingUser.id, payload.primaryEmailAddress);

                if (userEmail == null) {
                    requestMeta.otherDetails.error = 'Could not find primary email for user';
                    requestMeta.responseCode = 400;
                    await activityLogger.warn('Reset password email failed', requestMeta);
                    return httpResponseService.badData(h);
                }

                logger.debug(`Sending reset password email to user: ${existingUser.id}`);

                request.app.requestMeta = requestMeta;
                await emailService.sendForgotPasswordEmail(userEmail, uow, request, requestMeta);
                requestMeta.responseCode = 200;
                await activityLogger.info('Sent reset password email', request.app.requestMeta);

                return true;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Reset password email failed', requestMeta);
                return false;
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch reset password record', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                const entry = await uow.forgotPasswordsRepository.getEntry(request.params.token);
                if (entry && !entry.triggeredAt) {
                    const now = moment.utc();

                    if (now.diff(entry.createdAt, 'minutes') >= request.server.app.config.email.linkTimeout) {
                        logger.debug(`Link expired`);
                        requestMeta.otherDetails.error = 'Link expired';
                        requestMeta.responseCode = 200;
                        await activityLogger.warn('Fetch reset password record failed', requestMeta);
                        return false;
                    }
                    else {
                        requestMeta.responseCode = 200;
                        await activityLogger.info('Fetched reset password record', requestMeta);
                        return true;
                    }
                }
                requestMeta.otherDetails.error = 'Missing record';
                requestMeta.responseCode = 200;
                await activityLogger.warn('Fetch reset password record failed', requestMeta);
                return false;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch reset password record failed', requestMeta);
                return false;
            }
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
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Reset password', requestMeta);

            const uow = await request.app.getNewUoW();
            const httpResponseService = new HttpResponseService();
            const authService = new AuthService();
            const logger = request.server.app.logger;
            const payload = request.payload;
            const entry = await uow.forgotPasswordsRepository.getEntry(payload.token);
            
            try {
                if (entry && !entry.triggeredAt) {
                    const now = moment.utc();

                    logger.debug(`Forgot password for user: ${entry.userId}`);

                    if (payload.password != payload.confirmPassword) {
                        logger.debug(`Passwords don't match`);
                        requestMeta.otherDetails.error = 'Passwords do not match';
                        requestMeta.responseCode = 400;
                        await activityLogger.warn('Reset password failed', requestMeta);
                        return httpResponseService.badData(h);
                    }

                    await uow.forgotPasswordsRepository.trigger(payload.token, now.format());

                    if (now.diff(entry.createdAt, 'minutes') >= request.server.app.config.email.linkTimeout) {
                        logger.debug(`Link expired`);
                        requestMeta.otherDetails.error = 'Link expired';
                        requestMeta.responseCode = 200;
                        await activityLogger.warn('Reset password failed', requestMeta);
                        return false;
                    }
                    else {
                        const password = await authService.hashPassword(payload.password);
                        const user = await uow.usersRepository.editUser({password}, entry.userId);
                        logger.debug(`Forgot password successful`);
                        user.password = '*****';
                        requestMeta.before = user;
                        user.password = '********';
                        requestMeta.after = user;
                        requestMeta.responseCode = 200;
                        await activityLogger.info('Reset password', requestMeta);
                        return true;
                    }
                }

                requestMeta.otherDetails.error = 'Missing reset password record';
                requestMeta.responseCode = 200;
                await activityLogger.warn('Reset password failed', requestMeta);
                return false;
            } catch (err) {
                logger.error(err);
                requestMeta.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Reset password', requestMeta);
                return false;
            }
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