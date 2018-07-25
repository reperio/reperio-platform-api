const ReperioServer = require('hapijs-starter');
const jwt = require('jsonwebtoken');
const API = require('./api');
const UnitOfWork = require('./db');
const Config = require('./config');

const start = async function () {
    try {
        //status monitor is turned off due to dependency issue with the pidusage dependency on the master branch of hapijs-status-monitor
        const reperio_server = new ReperioServer({
            statusMonitor: true,
            cors: true,
            corsOrigins: ['*'],
            authEnabled: true,
            authSecret: Config.jsonSecret});

        const apiPluginPackage = {
            plugin: API,
            options: {},
            routes: {
                prefix: '/api'
            }
        };

        await reperio_server.registerAdditionalPlugin(apiPluginPackage);

        await reperio_server.registerExtension({
            type: 'onRequest',
            method: async (request, h) => {
                request.app.uows = [];
        
                request.app.getNewUoW = async () => {
                    const uow = new UnitOfWork(reperio_server.app.logger);
                    request.app.uows.push(uow);
                    return uow;
                };

                return h.continue;
            }
        });

        await reperio_server.registerExtension({
            type: "onPostAuth",
            method: async (request, h) => {
                if (request.auth.isAuthenticated) {
                    request.app.currentUserId = request.auth.credentials.currentUserId;
                }
    
                return h.continue;
            }
        });

        await reperio_server.registerExtension({
            type: "onPreResponse",
            method: async (request, h) => {
    
                if (request.app.currentUserId != null && request.response.header != null) {

                    const tokenPayload = {
                        currentUserId: request.app.currentUserId
                    };
                
                    const token = jwt.sign(tokenPayload, Config.jsonSecret, {
                        expiresIn: Config.jwtValidTimespan
                    });

                    request.response.header('Access-Control-Expose-Headers', 'Authorization');
                    request.response.header("Authorization", `Bearer ${token}`);
                }
    
                return h.continue;
            }
        });

        reperio_server.app.config = Config;

        await reperio_server.startServer();
    } catch (err) {
        console.error(err);
    }
};

start();
