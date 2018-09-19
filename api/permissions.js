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
        },
        options: {
            auth: false
        }
    },
    {
        method: 'GET',
        path: '/permissions/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching permission by id`);
            const id = request.params.id;

            const permission = await uow.permissionsRepository.getPermissionById(id);

            return permission;
        },
        options: {
            auth: false,
            validate: {
                params: {
                    id: Joi.string().guid().required()
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

            logger.debug(`Editing permission`);
            const id = request.params.permissionId;
            const payload = request.payload;

            const permission = await uow.permissionsRepository.editPermission(id, payload.name, payload.displayName, payload.description, payload.applicationId, payload.isSystemAdminPermission);
            await uow.permissionsRepository.managePermissionsUsedByRoles(payload.rolePermissions, id);

            return permission;
        },
        options: {
            auth: false,
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