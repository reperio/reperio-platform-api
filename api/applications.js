const Joi = require('joi');
const emailService = require('./services/emailService');

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

            const app = await uow.applicationsRepository.createApplication(payload.name, payload.apiUrl, payload.clientUrl, payload.secretKey);
            
            return app;
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const id = request.params.id;

            logger.debug(`Deleting application with id: ${id}`);

            const app = await uow.applicationsRepository.deleteApplication(id);
            
            return app;
        },
        options: {
            validate: {
                params: {
                    id: Joi.string().uuid().required()
                }
            }
        }  
    },
    {
        method: 'POST',
        path: '/applications/{applicationId}/userSignup',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;
            let errors = [];

            //send a confirmation email by default
            let sendConfirmationEmail = true;
            if (payload.sendConfirmationEmail != null) {
                sendConfirmationEmail = payload.sendConfirmationEmail;
            }

            try {

                logger.debug(`Creating user from survey`);
                const payload = request.payload;

                //set up models for each separate object
                const userModel = {
                    primaryEmailAddress: payload.primaryEmailAddress,
                    firstName: payload.firstName,
                    lastName: payload.lastName
                };

                let phones = payload.phones;
                logger.debug(phones);
                let organizations = payload.organizations;
                logger.debug(organizations);

                //begin the transaction
                await uow.beginTransaction();

                //if a user already has the submitted email, add it to errors and don't create it
                const existingUser = await uow.usersRepository.getUserByEmail(userModel.primaryEmailAddress);
                if (existingUser != null) {
                    let err = `A user with email ${existingUser.primaryEmailAddress} already exists and was not created`
                    errors.push(err);
                    logger.debug(err);
                }

                //if an organization matching the new organization information, add it to errors and don't create it
                let dbOrganizationIds = [];
                for(let organization of organizations){
                    const existingOrganization = await uow.organizationsRepository.getOrganizationByOrganizationInformation(organization);
                    if(existingOrganization.length === 0){
                        logger.debug(`Creating the organization ${organization.name}`);
                        const dbOrganization = await uow.organizationsRepository.createOrganization(organization);
                        dbOrganizationIds.push(dbOrganization.id);
                    }
                    else{
                        let err =  `The organization ${organization.name} already exists and was not created`
                        errors.push(err);
                        logger.debug(err);
                    }
                }

                //if there are any errors rollback the transaction and return all errors
                if(errors.length !== 0){
                    await uow.rollbackTransaction();

                    let errorResponse = {
                        success: false,
                        errors: errors
                    };

                    return errorResponse;
                }

                //create the user and link the organizations
                const user = await uow.usersRepository.createUser(userModel, dbOrganizationIds);

                //create userPhones based on the new user and phone information
                for(let phone of phones){
                    await uow.userPhonesRepository.createUserPhone(user.id, phone.phoneNumber, phone.phoneType);
                }

                //create userEmail based on the email and new user information
                const userEmail = await uow.userEmailsRepository.createUserEmail(user.id, user.primaryEmailAddress);
                await uow.usersRepository.editUser({primaryEmailId: userEmail.id}, user.id);

                //commit transaction
                await uow.commitTransaction();

                //send verification email based on sendConfirmationEmail boolean
                if(sendConfirmationEmail) {
                    logger.debug(`User verification is requested for user: ${user.id}`);

                    if (userEmail == null) {
                        return httpResponseService.badData(h);
                    }

                    logger.debug(`Sending user verification email to user: ${user.id}`);

                    await emailService.sendForgotPasswordEmail(userEmail, uow, request);
                }

                let response = {
                    success: true,
                    errors: errors
                };

                return response;
            }catch (err) {
                logger.error(err);
                errors.push(err);

                let response = {
                    success: false,
                    errors: errors
                };

                return response;
            }
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    primaryEmailAddress: Joi.string().required(),
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    phones: Joi.array()
                        .items(
                            Joi.object({
                                phoneNumber: Joi.string().required(),
                                phoneType: Joi.string().required()
                            })
                        ).required(),
                    organizations: Joi.array().items(
                        Joi.object({
                            name: Joi.string().required(),
                            streetAddress: Joi.string().required(),
                            suiteNumber: Joi.number().required(),
                            city: Joi.string().required(),
                            state: Joi.string().required(),
                            zip: Joi.string().required()
                        })
                    ).required(),
                    sendConfirmationEmail: Joi.boolean().optional(),
                    confirmationRedirectLink: Joi.string().optional()
                }
            }
        }
    }
];