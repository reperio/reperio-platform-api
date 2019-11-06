const Joi = require('joi');
const emailService = require('./services/emailService');
const httpResponseService = require('./services/httpResponseService');

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

            try {

                logger.debug(`Creating user from survey`);

                //set up models for each separate object
                const userModel = {
                    primaryEmailAddress: payload.primaryEmailAddress,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    disabled: false,
                    deleted: false,
                    emailVerified: false
                };

                let phones = payload.phones;
                let organizations = payload.organizations;

                //begin the transaction
                await uow.beginTransaction();

                //if a user already has the submitted email, add it to errors and don't create it
                const existingUser = await uow.usersRepository.getUserByEmail(userModel.primaryEmailAddress);
                if (existingUser != null) {
                    await uow.rollbackTransaction();
                    let err = `A user with email ${existingUser.primaryEmailAddress} already exists and was not created`
                    errors.push(err);
                    logger.error(err);

                    return httpResponseService.conflict(h);
                }
                else {

                    //if an organization matching the new organization information, add it to errors and don't create it
                    let dbOrganizationIds = [];
                    let dbRoleIds = [];
                    for (let organization of organizations) {
                        const existingOrganization = await uow.organizationsRepository.getOrganizationByOrganizationInformation(organization);
                        if (existingOrganization == null) {
                            logger.debug(`Creating the organization ${organization.name}`);
                            const dbOrganization = await uow.organizationsRepository.createOrganizationWithAddress(organization, false);
                            const userOrganizationRole = await uow.rolesRepository.createRole('Organization Admin', dbOrganization.id);
                            const userOrganizationRolePermissions = await uow.rolesRepository.updateRolePermissions(userOrganizationRole.id, ['UpdateOrganization']);
                            dbOrganizationIds.push(dbOrganization.id);
                            dbRoleIds.push(userOrganizationRole.id);
                        }
                        else {
                            await uow.rollbackTransaction();
                            let err = `The organization ${organization.name} already exists and was not created`
                            errors.push(err);
                            logger.error(err);

                            return httpResponseService.conflict(h);
                        }
                    }

                    //create personal organization for user
                    const personalOrganizationName = (`${payload.firstName} ${payload.lastName}`).substring(0, 255);
                    const personalOrganization = await uow.organizationsRepository.createOrganization(personalOrganizationName, true);
                    const userPersonalOrganiztionRole = await uow.rolesRepository.createRole('Organization Admin', personalOrganization.id);
                    const userPersonalOrganizationRolePermissions = await uow.rolesRepository.updateRolePermissions(userPersonalOrganiztionRole.id, ['UpdateOrganization']);
                    dbOrganizationIds.push(personalOrganization.id);
                    dbRoleIds.push(userPersonalOrganiztionRole.id);

                    //create the user and link the organizations
                    const user = await uow.usersRepository.createUser(userModel, dbOrganizationIds);

                    //add userRoles for Organization Admin
                    const userRoles = await uow.usersRepository.addRoles(user.id, dbRoleIds);

                    //create userPhones based on the new user and phone information
                    for (let phone of phones) {
                        await uow.userPhonesRepository.createUserPhone(user.id, phone.phoneNumber, phone.phoneType);
                    }

                    //commit transaction
                    await uow.commitTransaction();

                    //send verification email based on sendConfirmationEmail boolean
                    if (payload.sendConfirmationEmail) {
                        logger.debug(`Sending user verification email to user: ${user.id}`);

                        try {
                            await emailService.sendVerificationEmail(userEmail, uow, request, request.params.applicationId);
                        } catch (error) {
                            logger.error(`Failed to send verification email to user ${user.id}`);
                            logger.error(error);
                        }
                    }

                    let response = {
                        success: true,
                        userId: user.id,
                        organizationIds: dbOrganizationIds,
                        errors: errors
                    };

                    return response;
                }
            }
            catch (err) {
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
            auth: {
                strategies: ['jwt', 'application-token']
            },
            validate: {
                payload: {
                    primaryEmailAddress: Joi.string().email().max(255).required(),
                    firstName: Joi.string().max(255).required(),
                    lastName: Joi.string().max(255).required(),
                    phones: Joi.array()
                        .items(
                            Joi.object({
                                phoneNumber: Joi.string().max(255).required(),
                                phoneType: Joi.string().max(255).required()
                            })
                        ).required(),
                    organizations: Joi.array().items(
                        Joi.object({
                            name: Joi.string().max(255).required(),
                            streetAddress: Joi.string().max(255).required(),
                            suiteNumber: Joi.string().max(255).required().allow(''),
                            city: Joi.string().max(255).required(),
                            state: Joi.string().max(255).required(),
                            zip: Joi.string().max(255).required()
                        })
                    ).required(),
                    sendConfirmationEmail: Joi.boolean().optional().default(true),
                    confirmationRedirectLink: Joi.string().optional()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/applications/{applicationId}/organizationSearch',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const {applicationId} = request.params
            const {organizationIds} = request.payload;

            logger.debug(`Fetching organizations in list: ${organizationIds} that are active for application: ${applicationId}`);

            const organizations = await uow.applicationsRepository.getOrganizationsForApplicationByIds(applicationId, organizationIds);
            return organizations;
        },
        options: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            plugins: {
                requiredPermissions: ['ViewOrganizations', 'ViewApplications']
            },
            validate: {
                payload: {
                    organizationIds: Joi.array().items(Joi.string()).required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/applications/{applicationId}/emailNotification',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const applicationId = request.params.applicationId;
            const addressee = request.payload.addressee;
            const body = request.payload.body;

            logger.debug(`Sending email notification to ${addressee}, with body: ${body}`);

            try {
                await emailService.sendNotificationEmail(uow, request, applicationId, addressee, body);
                return true;
            } catch(err) {
                logger.error(err);
                throw err;
            }
            return false;
        },
        options: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            plugins: {
                requiredPermissions: ['ViewOrganizations']
            },
            validate: {
                params: {
                    applicationId: Joi.string().uuid().required()
                },
                payload: {
                    addressee: Joi.string().required(),
                    body: Joi.string().required()
                }
            }
        }
    }
];