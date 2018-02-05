const ReperioServer = require('hapijs-starter').default;
const API = require('./api');


const start = async function () {
    try {
        const reperio_server = new ReperioServer();

        const apiPluginPackage = {
            plugin: API,
            options: {},
            routes: {
                prefix: '/api'
            }
        };

        await reperio_server.registerAdditionalPlugin(apiPluginPackage);

        await reperio_server.startServer();
    } catch (err) {
        console.error(err);
    }
};

start();
