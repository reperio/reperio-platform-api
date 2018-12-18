const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const expect = chai.expect;

const { extensions } = require('../../extensions');
const mockUoW = require('./mockUoW');
const { createTestServer, adminAuthHeader, noPermissionsAuthHeader } = require('./testServer');

chai.use(sinonChai);

describe('Permissions API', () => {
    let server = null;

    beforeEach(async () => {
        server = await createTestServer();

        await server.registerExtension({ 
            type: 'onPreHandler', 
            method: async (request, h) => {
                request.app.getNewUoW = async () => {
                    return mockUoW;
                };
                
                return h.continue;
            }
        });
        await server.registerExtension(extensions.onPostAuth);
        await server.startServer();
    });

    afterEach(async () => {
        await server.server.stop();
        server = null;
    });

    // GET /permissions
    describe('GET /permissions', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/permissions',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 200 with permissions', async () => {
            const options = {
                url: '/api/permissions',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns array of permissions', async () => {
            const options = {
                url: '/api/permissions',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(Array.isArray(payload)).to.be.equal(true);
            expect(payload[0].name).not.to.be.equal(undefined);
            expect(payload[0].displayName).not.to.be.equal(undefined);
            expect(payload[0].description).not.to.be.equal(undefined);
            expect(payload[0].deleted).not.to.be.equal(undefined);
            expect(payload[0].isSystemAdminPermission).not.to.be.equal(undefined);
            expect(payload[0].createdDate).not.to.be.equal(undefined);
            expect(payload[0].lastEditedDate).not.to.be.equal(undefined);
        });
    });

    // GET /permissions/{name}
    describe('GET /permissions/{name}', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/permissions/ViewUser',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 200', async () => {
            const options = {
                url: '/api/permissions/ViewUsers',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns ViewUsers permission', async () => {
            const options = {
                url: '/api/permissions/ViewUsers',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(payload.name).not.to.be.equal(undefined);
            expect(payload.displayName).not.to.be.equal(undefined);
            expect(payload.description).not.to.be.equal(undefined);
            expect(payload.deleted).not.to.be.equal(undefined);
            expect(payload.isSystemAdminPermission).not.to.be.equal(undefined);
            expect(payload.createdDate).not.to.be.equal(undefined);
            expect(payload.lastEditedDate).not.to.be.equal(undefined);
        });
    });

    // PUT /permissions/{name}
    describe('PUT /permissions/{name}', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/permissions/bad-permission-name',
                method: 'PUT'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 400 with bad permission name', async () => {
            const options = {
                url: '/api/permissions/bad-permission-name',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 400 with bad payload', async () => {
            const options = {
                url: '/api/permissions/ViewUsers',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    bad: 'payload'
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 200', async () => {
            const options = {
                url: '/api/permissions/ViewUser',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    description: 'Allows for viewing all users',
                    displayName: 'View Users',
                    rolePermissions: [
                        {
                            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
                            permissionName: 'ViewName'
                        }
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns permission object', async () => {
            const options = {
                url: '/api/permissions/ViewUser',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    description: 'Allows for viewing all users',
                    displayName: 'View Users',
                    rolePermissions: [
                        {
                            roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
                            permissionName: 'ViewName'
                        }
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(payload.name).not.to.be.equal(undefined);
            expect(payload.displayName).not.to.be.equal(undefined);
            expect(payload.description).not.to.be.equal(undefined);
            expect(payload.deleted).not.to.be.equal(undefined);
            expect(payload.isSystemAdminPermission).not.to.be.equal(undefined);
            expect(payload.createdDate).not.to.be.equal(undefined);
            expect(payload.lastEditedDate).not.to.be.equal(undefined);
        });
    });
});