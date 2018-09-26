const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/roles',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Fetching all roles`);

            const roles = await uow.rolesRepository.getAllActiveRoles();
            
            return roles;
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
            
            await uow.beginTransaction();

            const role = await uow.rolesRepository.createRole(payload.name, payload.organizationId, payload.applicationId);

            await uow.rolesRepository.updateRolePermissions(role.id, payload.permissionIds);

            await uow.commitTransaction();

            return role;
        },
        options: {
            validate: {
                payload: {
                    name: Joi.string().required(),
                    organizationId: Joi.string().guid().required(),
                    applicationId: Joi.string().guid().allow(null),
                    permissionIds: Joi.array()
                        .items(
                            Joi.string().guid()
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
            const payload = request.payload;
            await uow.beginTransaction();

            const role = await uow.rolesRepository.editRole(id, payload.name);
            await uow.rolesRepository.updateRolePermissions(id, payload.permissionIds);

            await uow.commitTransaction();
            return role;
        },
        options: {
            validate: {
                params: {
                    id: Joi.string().guid(),
                },
                payload: {
                    name: Joi.string().required(),
                    permissionIds: Joi.array()
                        .items(
                            Joi.string()
                        ).min(1).required()
                }
            }
        }  
    },
    {
        method: 'DELETE',
        path: '/roles/{id}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const id = request.params.id;

            logger.debug(`Deleting role with id: ${id}`);

            const result = await uow.rolesRepository.deleteRole(id);
            
            return result;
        },
        options: {
            validate: {
                params: {
                    id: Joi.string().uuid().required()
                }
            }
        }  
    }

];