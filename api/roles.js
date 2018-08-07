const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/roles',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all roles`);

            const roles = await uow.rolesRepository.getAllRoles();
            
            return roles;
        },
        options: {
            //auth: false
        }
    },
    {
        method: 'GET',
        path: '/roles/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching role by id`);
            const id = request.params.id;

            const role = await uow.rolesRepository.getRoleById(id);
            
            return role;
        },
        options: {
        //auth: false,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                }
            }
        }  
    },
    {
        method: 'GET',
        path: '/roles/{id}/permissions',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching permissions by role id`);
            const id = request.params.id;

            const role = await uow.rolesRepository.getPermissionsByRoleId(id);
            
            return role;
        },
        options: {
        //auth: false,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                }
            }
        }  
    },
    {
        method: 'POST',
        path: '/roles',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Creating role`);
            const payload = request.payload;

            const role = await uow.rolesRepository.createRole(payload.name, payload.organizationId, payload.applicationId);

            await uow.rolePermissionsRepository.update(role.id, payload.permissionIds);
            
            return role;
        },
        options: {
        auth: false,
            validate: {
                payload: {
                    name: Joi.string().required(),
                    deleted: Joi.boolean().required(),
                    organizationId: Joi.string().guid().required(),
                    applicationId: Joi.string().guid().optional(),
                    permissionIds: Joi.array()
                        .items(
                            Joi.string()
                        ).min(1).required()
                }
            }
        }  
    },
    {
        method: 'PUT',
        path: '/roles/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Updating role`);
            const id = request.params.id;
            const permissionIds = request.payload.permissionIds;

            const rolePermissions = await uow.rolesRepository.updateRolePermissions(id, permissionIds);
            
            return rolePermissions;
        },
        options: {
        auth: false,
            validate: {
                params: {
                    id: Joi.string().guid(),
                },
                payload: {
                    permissionIds: Joi.array()
                        .items(
                            Joi.string()
                        ).min(1).required()
                }
            }
        }  
    }
];