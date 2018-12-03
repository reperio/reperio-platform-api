const jwt = require('jsonwebtoken');
const Config = require('./config');
const UnitOfWork = require('./db');
const RecaptchaService = require('./api/services/recaptchaService');
const MessageHelper = require('./helpers/messageHelper');
const RedisHelper = require('./helpers/redisHelper');
const PermissionService = require('./api/services/permissionService');
const os = require('os');
const Limit = require('hapi-rate-limit');
const API = require('./api');

const extensions = {
    onPostAuth: { 
        type: 'onPostAuth', 
        method: async (request, h) => {
            if (request.auth.isAuthenticated) {
                request.app.currentUserId = request.auth.credentials.currentUserId;
                request.app.userPermissions = request.auth.credentials.userPermissions;

                let requiredPermissions = null;
                if (request.route.settings.plugins.requiredPermissions) {
                    requiredPermissions = typeof request.route.settings.plugins.requiredPermissions === "function"
                        ? request.route.settings.plugins.requiredPermissions(request)
                        : request.route.settings.plugins.requiredPermissions;
                }

                if (requiredPermissions && request.auth.credentials.userPermissions && !PermissionService.userHasRequiredPermissions(request.auth.credentials.userPermissions, requiredPermissions)) {
                    const response = h.response('unauthorized');
                    response.statusCode = 401;
                    return response.takeover();
                }
            }

            return h.continue;
        }
    },
    onPreHandlerActivityLogging: {
        type: 'onPreHandler',
        method: async (request, h) => {
            await request.server.app.activityLogger.info('new request', {
                request: {
                    id: request.info.id,
                    params: request.params,
                    query: request.query,
                    payload: request.payload,
                    path: request.url.path,
                    method: request.url.method,
                    remoteAddress: request.info.remoteAddress
                },
                userId: request.app.currentUserId || null,
                hostname: os.hostname()
            });

            return h.continue;
        }
    },
    onPreHandlerRegisterAppFunctions: { 
        type: 'onPreHandler', 
        method: async (request, h) => {
            request.app.uows = [];
            request.app.getNewUoW = async () => {
                const uow = new UnitOfWork(request.server.app.logger);
                request.app.uows.push(uow);
                return uow;
            };
        
            request.app.getNewRecaptcha = async () => {
                const recaptcha = new RecaptchaService('https://www.google.com/recaptcha/api/siteverify', request.server.app.logger);
                return recaptcha;
            };

            request.app.getNewMessageHelper = async () => {
                return new MessageHelper(request.server.app.logger, Config);
            };

            request.app.getNewRedisHelper = async () => {
                return new RedisHelper(request.server.app.logger, Config);
            };

            return h.continue;
        }
    },
    onPreResponseActivityLogging: { 
        type: 'onPreResponse', 
        method: async (request, h) => {
            const meta = {
                request: {
                    id: request.info.id
                }
            };

            if (request.response.statusCode >= 400 && request.response.statusCode < 500) {
                meta.response = request.response.source;
            }
            await request.server.app.activityLogger.info('finished request', meta);

            return h.continue;
        }
    },
    onPreResponseAuthToken: { 
        type: 'onPreResponse', 
        method: async (request, h) => {
            if (request.app.currentUserId != null && request.app.userPermissions != null && request.response.header != null) {
                const tokenPayload = {
                    currentUserId: request.app.currentUserId,
                    userPermissions: request.app.userPermissions
                };
            
                const token = jwt.sign(tokenPayload, Config.jsonSecret, {
                    expiresIn: Config.jwtValidTimespan
                });

                request.response.header('Access-Control-Expose-Headers', 'Authorization');
                request.response.header("Authorization", `Bearer ${token}`);
            }

            return h.continue;
        }
    }
};

const registerExtensions = async (server) => {
    await server.registerExtension(extensions.onPostAuth);
    await server.registerExtension(extensions.onPreHandlerActivityLogging);
    await server.registerExtension(extensions.onPreHandlerRegisterAppFunctions);
    await server.registerExtension(extensions.onPreResponseActivityLogging);
    await server.registerExtension(extensions.onPreResponseAuthToken);
};

const registerAPIPlugin = async (server) => {
    const apiPluginPackage = {
        plugin: API,
        options: {},
        routes: {
            prefix: '/api'
        }
    };

    await server.registerAdditionalPlugin(apiPluginPackage);
};

const registerRateLimitPlugin = async (server) => {
    const limitPluginPackage = {
        plugin: Limit,
        options: {enabled: Config.limitEnabled, pathLimit: Config.limitPath, userLimit: Config.limitUser, trustProxy: Config.trustProxy, headers: Config.headers, ipWhitelist: Config.ipWhitelist, pathCache:{expiresIn: Config.pathCache.expiresIn}, userPathCache:{expiresIn: Config.userPathCache.expiresIn}}
    };

    await server.registerAdditionalPlugin(limitPluginPackage);
};

module.exports = { extensions, registerExtensions, registerAPIPlugin, registerRateLimitPlugin };