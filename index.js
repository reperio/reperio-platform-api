const Boom = require('boom');
const ReperioServer = require('@reperio/hapijs-starter');
const Config = require('./config');
const {knex} = require('./db/connect');
const extensions = require('./extensions');
const {getApplicationList} = require('./helpers/getApplicationList');

let reperio_server = null;

const start = async function () {
    try {
        //status monitor is turned off due to dependency issue with the pidusage dependency on the master branch of hapijs-status-monitor
        reperio_server = new ReperioServer.Server({
            statusMonitor: true,
            cors: true,
            corsOrigins: ['*'],
            accessControlAllowHeaders: 'Content-Type, Authorization, application-token',
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

        reperio_server.server.auth.scheme('application', function (server, options) {
            return {
                authenticate: async function (request, h) {
                    const headers = request.headers;

                    if (!headers['application-token']) {
                        return h.unauthenticated(Boom.unauthorized('Missing application token'));
                    }

                    const apps = await getApplicationList();
                    const verifiedApplication = apps[headers['application-token']];
                    if(!verifiedApplication) {
                        return h.unauthenticated(Boom.unauthorized('Invalid application token'));
                    }

                    h.authenticated({credentials: {currentApplication: verifiedApplication}});
                    return h.continue;
                }
            }
        })
        reperio_server.server.auth.strategy('application-token', 'application')

        // reperio_server.app.config = Config;
        await reperio_server.configure();

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
