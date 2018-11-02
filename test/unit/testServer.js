const os = require('os');
const API = require('../../api');
const uow = require('./mockUoW');
const Server = require('@reperio/hapijs-starter');

const server = new Server({ port: 1234, host: '0.0.0.0', statusMonitor: false, testMode: true });

const apiPluginPackage = {
    plugin: API,
    options: {},
    routes: {
        prefix: '/api'
    }
};

server.registerAdditionalPlugin(apiPluginPackage);

server.registerExtension({
    type: 'onRequest',
    method: async (request, h) => {

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
            return uow;
        };

        return h.continue;
    }
});

server.registerExtension({
    type: "onPreResponse",
    method: async (request, h) => {
        if (request.response.isBoom) {
            request.server.app.logger.error(request.info.id);
            request.server.app.logger.error(request.response);
        }

        return h.continue;
    }
});

module.exports = server;