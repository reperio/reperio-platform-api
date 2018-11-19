const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const expect = chai.expect;

const Server = require('@reperio/hapijs-starter');
const mockUoW = require('./mockUoW');
const { extensions, registerAPIPlugin, registerExtensions } = require('../../extensions');

chai.use(sinonChai);

const jsonSecret = '496d7e4d-eb86-4706-843b-5ede72fad0e8';
const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW50VXNlcklkIjoiZDA4YTFmNzYtN2M0YS00ZGQ5LWEzNzctODNmZmZmYTc1MmY0IiwidXNlcklkIjoiZDA4YTFmNzYtN2M0YS00ZGQ5LWEzNzctODNmZmZmYTc1MmY0IiwidXNlckVtYWlsIjoic3VwcG9ydEByZXBlci5pbyIsInVzZXJQZXJtaXNzaW9ucyI6WyJWaWV3VXNlcnMiLCJDcmVhdGVVc2VycyIsIkRlbGV0ZVVzZXJzIiwiTWFuYWdlVXNlck9yZ2FuaXphdGlvbnMiLCJNYW5hZ2VVc2VyUm9sZXMiLCJBZGRFbWFpbCIsIlNldFByaW1hcnlFbWFpbCIsIkRlbGV0ZUVtYWlsIiwiVmlld1JvbGVzIiwiQ3JlYXRlUm9sZXMiLCJVcGRhdGVSb2xlcyIsIkRlbGV0ZVJvbGVzIiwiVmlld09yZ2FuaXphdGlvbnMiLCJDcmVhdGVPcmdhbml6YXRpb25zIiwiVXBkYXRlT3JnYW5pemF0aW9ucyIsIkRlbGV0ZU9yZ2FuaXphdGlvbnMiLCJWaWV3UGVybWlzc2lvbnMiLCJVcGRhdGVQZXJtaXNzaW9ucyIsIlVwZGF0ZUJhc2ljVXNlckluZm8iLCJSZXNlbmRWZXJpZmljYXRpb25FbWFpbHMiXSwiaWF0IjoxNTQzMjUyNjQwLCJleHAiOjMzMTAwODUyNjQwfQ.fCOaMqGoe4butY4J4KbWrni4v9oJFNy7fGo0S4Fworc';

// tests
describe('Activity logging', () => {
    let server = null;

    // create a new server before each test
    beforeEach(async () => {
        server = new Server({
            statusMonitor: false,
            cors: true,
            corsOrigins: ['*'],
            authEnabled: true,
            authSecret: jsonSecret,
            testMode: true
        });

        await registerAPIPlugin(server);
        await server.registerExtension({ 
            type: 'onPreHandler', 
            method: async (request, h) => {
                request.app.getNewUoW = async () => {
                    return mockUoW;
                };

                request.app.getNewMessageHelper = async () => {
                    return {
                        processMessage: jest.fn()
                    };
                };
                
                return h.continue;
            }
        });
        await server.registerExtension(extensions.onPostAuth);
        await server.startServer();

        server.server.app.config = {
            jsonSecret: jsonSecret,
            jwtValidTimespan: '12h',
            email: {
                sender: 'fakeSender@reper.io'
            }
        };

        // replace all loggers
        server.server.app.logger = {
            debug: () => {return;},
            info: () => {return;},
            warn: () => {return;},
            error: () => {return;},
        };

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
    });

    // stop the server after each test and dereference it
    afterEach(async () => {
        await server.server.stop();
        server = null;
    });

    it('registerExtensions is called with all extensions', async () => {
        const spy = sinon.spy();
        const serverMock = {
            registerExtension: spy,
            server: {
                ext: jest.fn()
            }
        };

        await registerExtensions(serverMock);

        expect(spy).calledWith(extensions.onPostAuth);
        expect(spy).calledWith(extensions.onPreHandlerActivityLogging);
        expect(spy).calledWith(extensions.onPreHandlerRegisterAppFunctions);
        expect(spy).calledWith(extensions.onPreResponseActivityLogging);
        expect(spy).calledWith(extensions.onPreResponseAuthToken);
    });

    it('onPreHandler logs to activity logger', async () => {
        await server.registerExtension(extensions.onPreHandlerActivityLogging);

        const mockInfo = jest.fn();
        server.app.activityLogger.info = mockInfo;

        const options = {
            url: '/api/users',
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        };
        await server.server.inject(options);
        expect(mockInfo.mock.calls.length).to.be.equal(1);
    });

    it('onPreHandler logs user id for logged in users', async () => {
        await server.registerExtension(extensions.onPreHandlerActivityLogging);
        
        const mockInfo = jest.fn();
        server.app.activityLogger.info = mockInfo;

        const usersOptions = {
            url: '/api/users',
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        };
        await server.server.inject(usersOptions);
        expect(mockInfo.mock.calls.length).to.be.equal(1);

        const fnCallMetaProperty = mockInfo.mock.calls[0][1];
        expect(fnCallMetaProperty.userId).to.not.be.null;
    });

    it('onPreResponse logs to activity logger', async () => {
        await server.registerExtension(extensions.onPreResponseActivityLogging);

        const mockInfo = jest.fn();
        server.app.activityLogger.info = mockInfo;

        const options = {
            url: '/api/users',
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        };
        await server.server.inject(options);
        expect(mockInfo.mock.calls.length).to.be.equal(1);
    });

    it('onPreResponse logs response payload for 4xx responses', async () => {
        await server.registerExtension(extensions.onPreResponseActivityLogging);

        const mockInfo = jest.fn();
        server.app.activityLogger.info = mockInfo;

        const options = {
            url: '/api/users',
            method: 'POST',
            payload: {
                firstName: 'Bad',
                lastName: 'Data',
                password: 'passwords',
                confirmPassword: 'do not match',
                primaryEmailAddress: 'fakeEmail@reper.io'
            },
            headers: {
                'Authorization': authHeader
            }
        };
        await server.server.inject(options);
        expect(mockInfo.mock.calls.length).to.be.equal(1);

        const fnCallMetaProperty = mockInfo.mock.calls[0][1];
        expect(fnCallMetaProperty.response).to.not.be.undefined;
    });

    it('onPreResponse does not log response payload for non 4xx responses', async () => {
        await server.registerExtension(extensions.onPreResponseActivityLogging);

        const mockInfo = jest.fn();
        server.app.activityLogger.info = mockInfo;

        const options = {
            url: '/api/users',
            method: 'POST',
            payload: {
                firstName: 'Good',
                lastName: 'Data',
                password: 'passwords',
                confirmPassword: 'passwords',
                primaryEmailAddress: 'fakeEmail@reper.io',
                organizationIds: []
            },
            headers: {
                'Authorization': authHeader
            }
        };
        const response = await server.server.inject(options);
        expect(response.statusCode).to.be.equal(200);
        expect(mockInfo.mock.calls.length).to.be.equal(1);

        const fnCallMetaProperty = mockInfo.mock.calls[0][1];
        expect(fnCallMetaProperty.response).to.be.undefined;
    });
});