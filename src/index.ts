import ReperioServer from 'hapijs-starter'
import API from './api'


const start = async function () {
    try {
        const reperio_server = new ReperioServer();

        await reperio_server.startServer();

        const apiPluginPackage = {
            plugin: API,
            options: {},
            routes: {
                prefix: '/api'
            }
        };

        await reperio_server.registerAdditionalPlugin(apiPluginPackage);

    } catch (err) {
        console.error(err);
    }
}

start();
