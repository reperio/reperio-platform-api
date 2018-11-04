const ReperioServer = require('@reperio/hapijs-starter');
const jwt = require('jsonwebtoken');
const API = require('./api');
const UnitOfWork = require('./db');
const Config = require('./config');
const RecaptchaService = require('./api/services/recaptchaService');
const {knex} = require('./db/connect');
const MessageHelper = require('./helpers/messageHelper');
const RedisHelper = require('./helpers/redisHelper');
const Limit = require('hapi-rate-limit');
const PermissionService = require('./api/services/permissionService');
const os = require('os');

const start = async function () {
    try {
        //status monitor is turned off due to dependency issue with the pidusage dependency on the master branch of hapijs-status-monitor
        const reperio_server = new ReperioServer({
            statusMonitor: true,
            cors: true,
            corsOrigins: ['*'],
            authEnabled: true,
            authSecret: Config.jsonSecret
        });

        const apiPluginPackage = {
            plugin: API,
            options: {},
            routes: {
                prefix: '/api'
            }
        };

        const limitPluginPackage = {
            plugin: Limit,
            options: {enabled: Config.limitEnabled, pathLimit: Config.limitPath, userLimit: Config.limitUser, trustProxy: Config.trustProxy, headers: Config.headers, ipWhitelist: Config.ipWhitelist, pathCache:{expiresIn: Config.pathCache.expiresIn}, userPathCache:{expiresIn: Config.userPathCache.expiresIn}}
        };

        await reperio_server.registerAdditionalPlugin(limitPluginPackage);
        await reperio_server.registerAdditionalPlugin(apiPluginPackage);

        knex.on('query', (query) => {
            if (query.bindings) {
                for (let bind of query.bindings) {
                    query.sql = query.sql.replace('?', `'${bind}'`);
                }
            }
            reperio_server.app.logger.debug(query.sql);
        });

        reperio_server.app.config = Config;

        await reperio_server.registerExtension({
            type: 'onRequest',
            method: async (request, h) => {
                request.app.uows = [];

                request.app.getRequestDetails = () => {
                    return {
                        requestId: request.info.id,
                        requestPath: request.url.path,
                        requestMethod: request.url.method,
                        userId: request.app.userId || null,
                        before: {},
                        after: {},
                        otherDetails: {
                            requestRemoteAddress: request.info.remoteAddress,
                            hostname: os.hostname()
                        }
                    }
                };
                
                request.app.getNewUoW = async () => {
                    const uow = new UnitOfWork(reperio_server.app.logger);
                    request.app.uows.push(uow);
                    return uow;
                };
            
                request.app.getNewRecaptcha = async () => {
                    const recaptcha = new RecaptchaService('https://www.google.com/recaptcha/api/siteverify', reperio_server.app.logger);
                    return recaptcha;
                };

                request.app.getNewMessageHelper = async () => {
                    return new MessageHelper(reperio_server.app.logger, Config);
                };

                request.app.getNewRedisHelper = async () => {
                    return new RedisHelper(reperio_server.app.logger, Config);
                };

                return h.continue;
            }
        });

        await reperio_server.registerExtension({
            type: "onPostAuth",
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
        });

        await reperio_server.registerExtension({
            type: "onPreResponse",
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
                
                // verify activity log has been written to before replying with 200
                if (request.response.isBoom == undefined && !request.response.isBoom && request.path.includes('/api') && request.method.toUpperCase() != 'OPTIONS') {
                    reperio_server.app.logger.debug('checking activity log');
                    var queryOptions = {
                        from:   new Date - 60 * 1000,
                        until:  new Date,
                        limit:  100,
                        start:  0,
                        order:  'desc',
                        fields: ['requestId']
                    };
                    const loggedRequestIds = await new Promise ((resolve, reject) => {
                        request.server.app.activityLogger.query(queryOptions, function (err, result) {
                            if (err) {
                                reject(err);
                            }
                            const loggedRequestIds = result.dailyRotateFile.map(x => x.requestId);
                            resolve(loggedRequestIds);
                        });
                    });

                    if (!loggedRequestIds.includes(request.info.id)) {
                        request.server.app.logger.warn('Activity log failed to write to disk');
                        return h.response(null).code(500);
                    }
                }
                return h.continue;

            }
        });

        await reperio_server.startServer();
    } catch (err) {
        console.error(err);
    }
};

start();
