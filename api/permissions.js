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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all permissions`);

            const permissions = await uow.permissionsRepository.getAllPermissions();
            
            return permissions;
        }
    },
    {
        method: 'POST',
        path: '/permissions/query',
        config: {
            plugins: {
                requiredPermissions: ['ViewPermissions']
            },
            validate: {
                payload: {
                    page: Joi.number(),
                    pageSize: Joi.number(),
                    sort: Joi.array().items(
                        Joi.object({
                            id: Joi.string(),
                            desc: Joi.bool()
                        })
                    ).optional(),
                    filter: Joi.array().items(
                        Joi.object({
                            id: Joi.string(),
                            value: Joi.string()
                        })
                    ).optional()
                }
            }
        },
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const query = request.payload;

            logger.debug(`Fetching all permissions with query`);

            const { results, total } = await uow.permissionsRepository.getAllPermissionsQuery(query);

            let pages = Math.ceil(total / query.pageSize);
            
            return {
                data: results,
                pages
            };
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const name = request.params.name;

            logger.debug(`Fetching permission: ${name}`);

            const permission = await uow.permissionsRepository.getPermissionByName(name);

            return permission;
        } 
    },
    {
        method: 'PUT',
        path: '/permissions/{name}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const name = request.params.name;
            const payload = request.payload;

            logger.debug(`Editing permission: ${name}`);

            await uow.beginTransaction();

            const permission = await uow.permissionsRepository.editPermission(name, payload.displayName, payload.description, payload.applicationId, payload.isSystemAdminPermission);
            await uow.permissionsRepository.managePermissionsUsedByRoles(payload.rolePermissions, name);

            await uow.commitTransaction();

            return permission;
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