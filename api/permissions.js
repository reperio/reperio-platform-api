const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/permissions',
        config: {
            plugins: {
                requiredPermissions: ['ViewPermissions']
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch all permissions', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            try {
                logger.debug(`Fetching all permissions`);
                const permissions = await uow.permissionsRepository.getAllPermissions();
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched all permissions', requestMeta);
                return permissions;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch all permissions failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'GET',
        path: '/permissions/{name}',
        config: {
            plugins: {
                requiredPermissions: ['ViewPermissions']
            },
            validate: {
                params: {
                    name: Joi.string().required()
                }
            }
        },
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch permission by name', requestMeta);

            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            try {
                const name = request.params.name;
                logger.debug(`Fetching permission by permissionId: ${name}`);
                requestMeta.otherDetails.permissionName = name;
                const permission = await uow.permissionsRepository.getPermissionByName(name);
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched permission by id', requestMeta);
                return permission;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch permission by id failed', requestMeta);
                return h.response('server error').code(500);
            }
        }
    },
    {
        method: 'PUT',
        path: '/permissions/{name}',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Update permission by id', requestMeta);
            
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const name = request.params.name;
            const payload = request.payload;
            try {
                logger.debug(`Editing permission: ${name}`);
                requestMeta.otherDetails.permissionName = name;
                requestMeta.otherDetails.payload = payload;
                await uow.beginTransaction();
                requestMeta.before.permission = await uow.permissionsRepository.getPermissionById(name);
                const permission = await uow.permissionsRepository.editPermission(name, payload.displayName, payload.description, payload.applicationId, payload.isSystemAdminPermission);
                const results = await uow.permissionsRepository.managePermissionsUsedByRoles(payload.rolePermissions, name);

                logger.debug(`Editing permission: ${name}`);
                await uow.commitTransaction();

                requestMeta.after.permission = permission;
                requestMeta.before.rolePermissions = results.before;
                requestMeta.after.rolePermissions = results.after;
                requestMeta.responseCode = 200;
                await activityLogger.info('Updated permission by id', requestMeta);

                return permission;
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Update permission by id failed', requestMeta);
                return h.response('server error').code(500);
            }
        },
        options: {
            validate: {
                params: {
                    name: Joi.string()
                },
                payload: {
                    description: Joi.string().required(),
                    displayName: Joi.string().required(),
                    applicationId: Joi.string().guid().optional(),
                    isSystemAdminPermission: Joi.boolean().optional(),
                    rolePermissions: Joi.array()
                        .items(
                            Joi.object({
                                roleId :Joi.string().guid(),
                                permissionName: Joi.string()
                            })
                        )
                        .required()
                }
            }
        }
    }
];