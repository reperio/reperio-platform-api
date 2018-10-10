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
        path: '/roles/{roleId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const roleId = request.params.roleId;
            logger.debug(`Fetching role by id: ${roleId}`);

            const role = await uow.rolesRepository.getRoleById(roleId);
            
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
        path: '/roles/{roleId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug(`Updating role`);
            const roleId = request.params.roleId;
            const payload = request.payload;
            await uow.beginTransaction();

            const role = await uow.rolesRepository.editRole(roleId, payload.name);
            await uow.rolesRepository.updateRolePermissions(roleId, payload.permissionIds);

            await uow.commitTransaction();
            return role;
        },
        options: {
            validate: {
                params: {
                    roleId: Joi.string().guid(),
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
        path: '/roles/{roleId}',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            const roleId = request.params.roleId;

            logger.debug(`Deleting role with id: ${roleId}`);

            const result = await uow.rolesRepository.deleteRole(roleId);
            
            return result;
        },
        options: {
            validate: {
                params: {
                    roleId: Joi.string().uuid().required()
                }
            }
        }  
    }

];