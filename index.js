const ReperioServer = require('@reperio/hapijs-starter');
const Config = require('./config');
const {knex} = require('./db/connect');
const extensions = require('./extensions');

let reperio_server = null;



const start = async function () {
    try {
        //status monitor is turned off due to dependency issue with the pidusage dependency on the master branch of hapijs-status-monitor
        reperio_server = new ReperioServer({
            statusMonitor: true,
            cors: true,
            corsOrigins: ['*'],
            authEnabled: true,
            authSecret: Config.jsonSecret,
            cache: [
                {
                    engine: require('catbox-redis'),
                    host: Config.redis.host,
                    port: Config.redis.port,
                    partition: 'cache'
                }
            ]
        });

        reperio_server.app.config = Config;

        knex.on('query', (query) => {
            if (query.bindings) {
                for (let bind of query.bindings) {
                    query.sql = query.sql.replace('?', `'${bind}'`);
                }
            }
            reperio_server.app.logger.debug(query.sql);
        });

        await extensions.registerAPIPlugin(reperio_server);
        await extensions.registerRateLimitPlugin(reperio_server);
        await extensions.registerExtensions(reperio_server);

        await reperio_server.startServer();
    } catch (err) {
        console.error(err);
    }
};

start();
