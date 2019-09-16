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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all roles`);

            const roles = await uow.rolesRepository.getAllActiveRoles();
            
            return roles;
        }
    },
    {
        method: 'POST',
        path: '/roles/query',
        config: {
            plugins: {
                requiredPermissions: ['ViewRoles']
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

            logger.debug(`Fetching all roles with query`);

            const { results, total } = await uow.rolesRepository.getAllActiveRolesQuery(query);

            let pages = Math.ceil(total / query.pageSize);
            
            return {
                data: results,
                pages
            };
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const roleId = request.params.roleId;
            logger.debug(`Fetching role by id: ${roleId}`);

            const role = await uow.rolesRepository.getRoleById(roleId);
            
            return role;
        }
    },
    {
        method: 'GET',
        path: '/roles/{roleId}/permissions',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const roleId = request.params.roleId;

            logger.debug(`Fetching permissions by role id: ${roleId}`);

            const role = await uow.rolesRepository.getPermissionsByRoleId(roleId);
            
            return role;
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Creating role`);
            const payload = request.payload;
            
            await uow.beginTransaction();

            const role = await uow.rolesRepository.createRole(payload.name, payload.organizationId, payload.applicationId);

            await uow.rolesRepository.updateRolePermissions(role.id, payload.permissions);

            await uow.commitTransaction();

            return role;
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Updating role`);
            const roleId = request.params.roleId;
            const payload = request.payload;
            await uow.beginTransaction();

            const role = await uow.rolesRepository.editRole(roleId, payload.name);
            await uow.rolesRepository.updateRolePermissions(roleId, payload.permissions);

            await uow.commitTransaction();
            return role;
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
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const roleId = request.params.roleId;

            logger.debug(`Deleting role with id: ${roleId}`);

            const result = await uow.rolesRepository.deleteRole(roleId);
            
            return result;
        }
    }
];