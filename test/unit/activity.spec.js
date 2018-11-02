const _ = require('lodash');
const chai = require("chai");
const sinonChai = require("sinon-chai");
const expect = chai.expect;

const server = require('./testServer');
server.startServer();

const Joi = require('joi');

chai.use(sinonChai);

describe('Activity Logging', () => {
    const testRoutes = [];

    _.each(['get', 'put', 'post', 'delete'], method => {
        _.each(server.server._core.router.routes[method].routes, route => {
            if (route.path.includes('/api')) {
                testRoutes.push({url: route.path, method: method.toUpperCase()});
            }

            // replace the route handler to suppress console.error messages from things not being in the route
            // we only care about activity logging so it doesn't matter for this test file
            const routeHandler = route.route.settings.handler;
            const newHandler = async function (request, h) {
                try {
                    await routeHandler(request, h);
                } catch (err) {
                    //do nothing because we don't care about the response
                }

                return h.response('').code(200);
            };
            route.route.settings.handler = newHandler;

            route.route.settings.validate.params = Joi.any();
            route.route.settings.validate.query = Joi.any();
            route.route.settings.validate.payload = Joi.any();
            route.route.settings.validate.headers = Joi.any();
        });
    });

    // replace all loggers
    server.server.app.logger = {
        debug: () => {return;},
        info: () => {return;},
        warn: () => {return;},
        error: () => {return;},
    }
    
    server.server.app.traceLogger = {
        debug: () => {return;},
        info: () => {return;},
        warn: () => {return;},
        error: () => {return;}
    };
    
    server.server.app.activityLogger = {
        debug: () => {return;},
        info: () => {return;},
        warn: () => {return;},
        error: () => {return;}
    };

    _.each(testRoutes, route => {
        it(`route ${route.method.toUpperCase()} ${route.url} logs activity`, async () => {
            const mockInfo = jest.fn();
            server.app.activityLogger.info = mockInfo;
            server.app.activityLogger.warn = mockInfo;
            server.app.activityLogger.error = mockInfo;
            server.app.activityLogger.debug = mockInfo;
            await server.server.inject(route);
            expect(mockInfo.mock.calls.length).to.be.above(0);
        });
    });
});