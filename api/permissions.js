const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/permissions',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all permissions`);

            const permissions = await uow.permissionsRepository.getAllPermissions();
            
            return permissions;
        }
    },
    {
        method: 'GET',
        path: '/permissions/{permissionId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const permissionId = request.params.permissionId;

            logger.debug(`Fetching permission by permissionId: ${permissionId}`);

            const permission = await uow.permissionsRepository.getPermissionById(permissionId);

            return permission;
        },
        options: {
            validate: {
                params: {
                    permissionId: Joi.string().guid().required()
                }
            }
        }  
    },
    {
        method: 'PUT',
        path: '/permissions/{permissionId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const permissionId = request.params.permissionId;
            const payload = request.payload;

            logger.debug(`Editing permission: ${permissionId}`);

            await uow.beginTransaction();

            const permission = await uow.permissionsRepository.editPermission(permissionId, payload.name, payload.displayName, payload.description, payload.applicationId, payload.isSystemAdminPermission);
            await uow.permissionsRepository.managePermissionsUsedByRoles(payload.rolePermissions, permissionId);

            await uow.commitTransaction();

            return permission;
        },
        options: {
            validate: {
                params: {
                    permissionId: Joi.string().guid()
                },
                payload: {
                    name: Joi.string().required(),
                    description: Joi.string().required(),
                    displayName: Joi.string().required(),
                    applicationId: Joi.string().guid().optional(),
                    isSystemAdminPermission: Joi.boolean().optional(),
                    rolePermissions: Joi.array()
                        .items(
                            Joi.object({
                                roleId :Joi.string().guid(),
                                permissionId: Joi.string().guid()
                            })
                        )
                        .required()
                }
            }
        }
    }
];