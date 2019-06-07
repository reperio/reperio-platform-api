const Joi = require('joi');
const httpResponseService = require('./services/httpResponseService');
const permissionService = require('./services/permissionService')

module.exports = [
    {
        method: 'POST',
        path: '/organizations',
        options: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    userId: Joi.string().guid().required(),
                    personal: Joi.bool().required(),
                    address: Joi.object({
                        'streetAddress': Joi.string().required(),
                        'suiteNumber': Joi.string().required().allow(''),
                        'city': Joi.string().required(),
                        'state': Joi.string().required(),
                        'zip': Joi.string().required()
                    }).optional()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const payload = request.payload;

            logger.debug(`Creating organization`);
            let organization;
            await uow.beginTransaction();

            if(payload.address != null){
                const organizationModel = {
                    name: payload.name,
                    ...payload.address
                };

                const existingOrganization = await uow.organizationsRepository.getOrganizationByOrganizationInformation(organizationModel);

                if (existingOrganization == null) {
                    logger.debug(`Creating the organization ${organizationModel.name}`);
                    organization = await uow.organizationsRepository.createOrganizationWithAddress(organizationModel);
                }
                else{
                    return httpResponseService.conflict(h);
                }
            }
            else {
                organization = await uow.organizationsRepository.createOrganization(payload.name, payload.personal);
            }
            //add Organization Admin role, add role permission, add userRole mapping
            const role = await uow.rolesRepository.createRole('Organization Admin', organization.id);
            const rolePermission = await uow.rolesRepository.updateRolePermissions(role.id, ['UpdateOrganization']);
            const userRole = await uow.usersRepository.addRoles(payload.userId, [role.id]);

            await uow.commitTransaction();

            return organization;
        }
    },
    {
        method: 'DELETE',
        path: '/organizations/{organizationId}',
        config: {
            plugins: {
                requiredPermissions: ['ViewOrganizations', 'DeleteOrganizations']
            },
            validate: {
                params: {
                    organizationId: Joi.string().uuid().required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const organizationId = request.params.organizationId;

            logger.debug(`Deleting organization with id: ${organizationId}`);

            const result = await uow.organizationsRepository.deleteOrganization(organizationId);
            
            return result;
        }
    },
    {
        method: 'GET',
        path: '/organizations',
        config: {},
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const userId = request.auth.credentials.currentUserId;

            logger.debug(`Fetching organizations for userId: ${userId}`);

            const organizations = await uow.organizationsRepository.getOrganizationsByUserWithBilling(userId);

            return organizations;
        }
    },
    {
        method: 'GET',
        path: '/organizations/{organizationId}',
        config: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            plugins: {
                requiredPermissions: ['ViewOrganizations']
            },
            validate: {
                params: {
                    organizationId: Joi.string().uuid().required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const organizationId = request.params.organizationId;

            logger.debug(`Fetching organization by organizationId: ${organizationId}`);

            const organization = await uow.organizationsRepository.getOrganizationById(organizationId);
            
            return organization;
        }
    },
    {
        method: 'POST',
        path: '/organizations/{organizationId}/applications',
        config: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            validate: {
                params: {
                    organizationId: Joi.string().uuid().required()
                },
                payload: {
                    userId: Joi.string().guid().required(),
                    applicationId: Joi.string().uuid().required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const {userId, applicationId} = request.payload;
            const organizationId = request.params.organizationId;

            logger.debug(`Creating application for organization`);
            const userRoles = await uow.usersRepository.getUserRoles(userId);
            
            const hasPermission = userRoles.find(role => {
                if (role.organizationId === organizationId) {
                    switch (role.name) {
                        case 'Organization Admin':
                            return true;
                        default:
                            return false;
                    }
                } else if (role.name === 'Core Super Admin') {
                    return true;
                }
            });
            
            if (!hasPermission) {
                return httpResponseService.unauthorized(h);
            }

            try {
                const applicationOrganization = await uow.organizationsRepository.getApplicationOrganization(organizationId, applicationId);
                if (applicationOrganization) {
                    return true;
                }
                await uow.beginTransaction();
                await uow.organizationsRepository.createApplicationOrganization(organizationId, applicationId);
                await uow.commitTransaction();
                return true;
            } catch (err) {
                logger.error(err);
                uow.rollbackTransaction();
                throw err;
            }
        }
    },
    {
        method: 'POST',
        path: '/organizations/{organizationId}/applications/{applicationId}/enable',
        config: {
            auth: {
                strategies: ['jwt', 'application-token']
            },
            validate: {
                params: {
                    organizationId: Joi.string().guid().required(),
                    applicationId: Joi.string().guid().required()
                },
                payload: {
                    userId: Joi.string().guid().required()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const {organizationId, applicationId} = request.params;
            const {userId} = request.payload;

            logger.debug(`Enabling application for organization`);
            const userRoles = await uow.usersRepository.getUserRoles(userId);
            
            const hasPermission = userRoles.find(role => {
                if (role.organizationId === organizationId) {
                    switch (role.name) {
                        case 'Organization Admin':
                            return true;
                        default:
                            return false;
                    }
                } else if (role.name === 'Core Super Admin') {
                    return true;
                }
            });
            
            if (!hasPermission) {
                return httpResponseService.unauthorized(h);
            }

            try {
                await uow.beginTransaction();
                const applicationOrganization = await uow.organizationsRepository.enableApplicationOrganization(organizationId, applicationId);
                await uow.commitTransaction();
                return true;
            } catch (err) {
                logger.error(err);
                uow.rollbackTransaction();
                throw err;
            }
        }
    }
];