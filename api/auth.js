const Joi = require('joi');
const authService = require('./services/authService');
const httpResponseService = require('./services/httpResponseService');
const emailService = require('./services/emailService');
const recaptchaService = require('./services/recaptchaService');
const permissionService = require('./services/permissionService');
const moment = require('moment');

const uuid4 = require("uuid/v4");

module.exports = [
    {
        method: 'GET',
        path: '/auth',
        handler: async (request, h) => {
            const {userId} = request.auth.credentials;
            const uow = await request.app.getNewUoW();
            const user = await uow.usersRepository.getUserById(userId);
            const permissions = permissionService.getUserPermissions(user)
            
            const userWithPermissions = {
                ...user,
                password: null,
                permissions
            };

            return userWithPermissions;
        }
    },
    {
        method: 'POST',
        path: '/auth/login',
        handler: async (request, h) => {
            const logger = request.server.app.logger;
            
            try {
                const payload = request.payload;
                logger.debug(`Login attempt for email: ${payload.primaryEmailAddress}`);
                const uow = await request.app.getNewUoW();

                const user = await uow.usersRepository.getUserByEmail(payload.primaryEmailAddress);

                if (!user || !(await authService.validatePassword(payload.password, user.password))) {
                    return httpResponseService.unauthorized(h);
                }

                user.password = null;

                const token = authService.getAuthToken(user, request.server.app.config.jsonSecret, request.server.app.config.jwtValidTimespan);

                const redisHelper = await request.app.getNewRedisHelper();
                await redisHelper.addJWT(token)

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
    },
    {
        method: 'POST',
        path: '/auth/logout',
        handler: async (request, h) => {
            const logger = request.server.app.logger;

            logger.debug(`Logging out: ${request.auth.credentials.currentUserId}`);

            const redisHelper = await request.app.getNewRedisHelper();
            await redisHelper.deleteJWT(request.auth.token)

            return "";
        }
    },
    {
        method: 'POST',
        path: '/auth/otp',
        handler: async (request, h) => {
            const {otp} = request.payload;
            const redisHelper = await request.app.getNewRedisHelper();
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                const payload = request.payload;

                logger.debug(`New account signup with email: ${payload.primaryEmailAddress}`);

                //validate signup details
                if (payload.password !== payload.confirmPassword) {
                    return httpResponseService.badData(h);
                }

                await uow.beginTransaction();

                const existingUser = await uow.usersRepository.getUserByEmail(payload.primaryEmailAddress);
                if (existingUser != null) {
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

                const redisHelper = await request.app.getNewRedisHelper();
                await redisHelper.addJWT(token)

                await uow.commitTransaction();

                //send verification email
                await emailService.sendVerificationEmail(userEmail, uow, request, payload.applicationId);

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
                    confirmPassword: Joi.string().required(),
                    applicationId: Joi.string().optional().allow(null).allow('')
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/auth/sendVerificationEmail',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;

            logger.debug(`Ssending verification email for user: ${payload.userId}`);
            try {
                await uow.beginTransaction();
                const userEmail = await uow.userEmailsRepository.getUserEmail(payload.userId, payload.email);
                if (userEmail == null) {
                    return httpResponseService.badData(h);
                }
                //send verification email
                await emailService.sendVerificationEmail(userEmail, uow, request, payload.applicationId);
                await uow.commitTransaction();

                return true;
            } catch (err) {
                logger.error(err);
                throw err;
            }
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    email: Joi.string().required(),
                    userId: Joi.string().guid().required(),
                    applicationId: Joi.string().optional().allow(null).allow('')
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/auth/recaptcha',
        handler: async (request, h) => {
            const logger = request.server.app.logger;
            const payload = request.payload;

            try {
                const response = await recaptchaService.siteVerify(request.server.app.config.secret, payload.response, request.info.remoteAddress);
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
            const logger = request.server.app.logger;
            const payload = request.payload;

            const existingUser = await uow.usersRepository.getUserByEmail(payload.primaryEmailAddress);
            if (existingUser == null) {
                return httpResponseService.badData(h);
            }

            logger.debug(`Password reset is requested from user: ${existingUser.id}`);

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
            const logger = request.server.app.logger;
            const payload = request.payload;
            const entry = await uow.forgotPasswordsRepository.getEntry(payload.token);
            
            if (entry && !entry.triggeredAt) {
                const now = moment.utc();

                logger.debug(`Forgot password for user: ${entry.userId}`);

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