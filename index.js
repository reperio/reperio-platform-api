const ReperioServer = require('hapijs-starter').default;
const API = require('./api');
const UnitOfWork = require('./db');
const Config = require('./config');

const start = async function () {
    try {
        const reperio_server = new ReperioServer({authEnabled: true, authSecret: Config.jsonSecret});

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

        reperio_server.app.config = Config;

        await reperio_server.startServer();
    } catch (err) {
        console.error(err);
    }
};

start();
