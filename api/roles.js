const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/roles',
        config: {
            plugins: {
                requiredPermissions: ['ViewRoles']
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch all roles', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                logger.debug(`Fetching all roles`);
                const roles = await uow.rolesRepository.getAllActiveRoles();
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched all roles', requestMeta);
                return roles;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch all roles failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'GET',
        path: '/roles/{roleId}',
        config: {
            plugins: {
                requiredPermissions: ['ViewRoles']
            },
            validate: {
                params: {
                    roleId: Joi.string().guid().required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch role by id', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const roleId = request.params.roleId;

            try {
                logger.debug(`Fetching role by id: ${roleId}`);
                requestMeta.otherDetails.roleId = roleId;
                const role = await uow.rolesRepository.getRoleById(roleId);
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched role by id', requestMeta);
                return role;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch role by id failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'GET',
        path: '/roles/{roleId}/permissions',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch permissions by role id', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const roleId = request.params.roleId;

            try {
                logger.debug(`Fetching permissions by role id: ${roleId}`);
                requestMeta.otherDetails.roleId = roleId;
                const role = await uow.rolesRepository.getPermissionsByRoleId(roleId);
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched permissions by role id', requestMeta);
                return role;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch permissions by role id failed', requestMeta);
                return h.response('server error').code(500);
            }
        },
        options: {
            validate: {
                params: {
                    roleId: Joi.string().guid().required()
                }
            }
        }  
    },
    {
        method: 'POST',
        path: '/roles',
        config: {
            plugins: {
                requiredPermissions: ['ViewRoles', 'CreateRoles']
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    organizationId: Joi.string().guid().required(),
                    applicationId: Joi.string().guid().allow(null),
                    permissions: Joi.array()
                        .items(
                            Joi.string()
                        ).min(1).required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Create role', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                logger.debug(`Creating role`);
                const payload = request.payload;
                requestMeta.otherDetails.payload = payload;
                await uow.beginTransaction();

                const role = await uow.rolesRepository.createRole(payload.name, payload.organizationId, payload.applicationId);
                requestMeta.after = role;
                const result = await uow.rolesRepository.updateRolePermissions(role.id, payload.permissions);
                requestMeta.after = result.after;
                await uow.commitTransaction();

                requestMeta.responseCode = 200;
                await activityLogger.info('Created role', requestMeta);
                return role;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Create role failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'PUT',
        path: '/roles/{roleId}',
        config: {
            plugins: {
                requiredPermissions: ['ViewRoles', 'UpdateRoles']
            },
            validate: {
                params: {
                    roleId: Joi.string().guid(),
                },
                payload: {
                    name: Joi.string().required(),
                    permissions: Joi.array()
                        .items(
                            Joi.string()
                        ).min(1).required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Update role', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                logger.debug(`Updating role`);
                const roleId = request.params.roleId;
                const payload = request.payload;
                
                requestMeta.otherDetails.roleId = roleId;
                requestMeta.otherDetails.payload = payload;

                await uow.beginTransaction();
                requestMeta.before.role = await uow.rolesRepository.getRoleById(roleId);
                const role = await uow.rolesRepository.editRole(roleId, payload.name);
                const results = await uow.rolesRepository.updateRolePermissions(roleId, payload.permissions);

                await uow.commitTransaction();

                requestMeta.before.rolePermissions = results.before;
                requestMeta.after = {
                    role: role,
                    rolePermissions: results.after
                };
                requestMeta.responseCode = 200;
                await activityLogger.info('Updated role', requestMeta);

                return role;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Update role failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'DELETE',
        path: '/roles/{roleId}',
        config: {
            plugins: {
                requiredPermissions: ['ViewRoles', 'DeleteRoles']
            },
            validate: {
                params: {
                    roleId: Joi.string().uuid().required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Delete role by id', requestMeta);
            
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const roleId = request.params.roleId;

            try {
                logger.debug(`Deleting role with id: ${roleId}`);
                requestMeta.otherDetails.roleId = roleId;
                requestMeta.before = await uow.rolesRepository.getRoleById(roleId);
                const result = await uow.rolesRepository.deleteRole(roleId);
                requestMeta.after = result;
                requestMeta.responseCode = 200;
                await activityLogger.info('Delete role by id', requestMeta);
                return result;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Delete role by id failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    }
];