const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const expect = chai.expect;
const config = require('../../config');

const { extensions, registerExtensions, filterProperties } = require('../../extensions');
const mockUoW = require('./mockUoW');
const { createTestServer, adminAuthHeader } = require('./testServer');

chai.use(sinonChai);


// tests
describe('Activity logging', () => {
    let server = null;

    // create a new server before each test
    beforeEach(async () => {
        server = await createTestServer();

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
    });

    // stop the server after each test and dereference it
    afterEach(async () => {
        await server.server.stop();
        server = null;
    });
    describe('Activity logging handlers', () => {
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
                    'Authorization': adminAuthHeader
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
                    'Authorization': adminAuthHeader
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
                    'Authorization': adminAuthHeader
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
                    'Authorization': adminAuthHeader
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
                    'Authorization': adminAuthHeader
                }
            };
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
            expect(mockInfo.mock.calls.length).to.be.equal(1);

            const fnCallMetaProperty = mockInfo.mock.calls[0][1];
            expect(fnCallMetaProperty.response).to.be.undefined;
        });

        it('onPreHandler masks password properties', async () => {
            await server.registerExtension(extensions.onPreHandlerActivityLogging);

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
                    'Authorization': adminAuthHeader
                }
            };
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
            expect(mockInfo.mock.calls.length).to.be.equal(1);

            const fnCallMetaProperty = mockInfo.mock.calls[0][1];
            expect(fnCallMetaProperty.request.payload.password).to.be.equal(config.logObfuscation.mask);
            expect(fnCallMetaProperty.request.payload.confirmPassword).to.be.equal(config.logObfuscation.mask);
        });
    });

    describe('filterProperties method', () => {
        it('masks property in object', async () => {
            const obj = {
                extra: 'stuff',
                password: 'test password',
                notNeeded: true
            };
            const mask = '*****';

            const filteredObj = await filterProperties(obj, ['password'], mask);
            expect(filteredObj.password).to.be.equal(mask);
        });

        it('masks property in nested object', async () => {
            const obj = {
                nestedProperty: {
                    password: 'test password',
                    notNeeded: true
                }
            };
            const mask = '*****';

            const filteredObj = await filterProperties(obj, ['password'], mask);
            expect(filteredObj.nestedProperty.password).to.be.equal(mask);
        });

        it('masks properties inside array', async () => {
            const arr = [
                {
                    password: 'test password',
                    notNeeded: true
                }, {
                    nestedProperty: {
                        extra: 'stuff',
                        password: 'test password'
                    }
                }
            ];

            const mask = '*****';

            const filteredArr = await filterProperties(arr, ['password'], mask);
            expect(filteredArr[0].password).to.be.equal(mask);
            expect(filteredArr[1].nestedProperty.password).to.be.equal(mask);
        });
    });
});