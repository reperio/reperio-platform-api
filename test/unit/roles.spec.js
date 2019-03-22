const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const expect = chai.expect;

const { extensions } = require('../../extensions');
const mockUoW = require('./mockUoW');
const { createTestServer, adminAuthHeader, noPermissionsAuthHeader } = require('./testServer');

chai.use(sinonChai);

describe('Roles API', () => {
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
    });

    afterEach(async () => {
        await server.server.stop();
        server = null;
    });

    describe('GET /roles', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/roles',
                method: 'GET',
                headers: {
                    'Authorization': noPermissionsAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 200 with permissions', async () => {
            const options = {
                url: '/api/roles',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns array of roles', async () => {
            const options = {
                url: '/api/roles',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(Array.isArray(payload)).to.be.equal(true);
            expect(payload[0].id).not.to.be.equal(undefined);
            expect(payload[0].name).not.to.be.equal(undefined);
            expect(payload[0].deleted).not.to.be.equal(undefined);
            expect(payload[0].organizationId).not.to.be.equal(undefined);
            expect(payload[0].applicationId).not.to.be.equal(undefined);
        });
    });

    describe('GET /roles/{roleId}', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'GET',
                headers: {
                    'Authorization': noPermissionsAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 400 with bad role id', async () => { 
            const options = {
                url: '/api/roles/bad-role-id',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 200 with permissions', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns role object', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(typeof payload).to.be.equal('object');
            expect(payload.id).not.to.be.equal(undefined);
            expect(payload.name).not.to.be.equal(undefined);
            expect(payload.deleted).not.to.be.equal(undefined);
            expect(payload.organizationId).not.to.be.equal(undefined);
            expect(payload.applicationId).not.to.be.equal(undefined);
        });
    });

    describe('GET /roles/{roleId}/permissions', () => {
        it('returns 401 with no permissions', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459/permissions',
                method: 'GET',
                headers: {
                    'Authorization': noPermissionsAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 400 with bad role id', async () => { 
            const options = {
                url: '/api/roles/bad-role-id/permissions',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 200 with permissions', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459/permissions',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns an array of permissions', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459/permissions',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(Array.isArray(payload)).to.be.equal(true);
            expect(payload[0].roleId).not.to.be.equal(undefined);
            expect(payload[0].permissionName).not.to.be.equal(undefined);
        });
    });

    describe('POST /roles', () => {
        it('returns 401 with no permissions', async () => { 
            const options = {
                url: '/api/roles',
                method: 'POST',
                headers: {
                    'Authorization': noPermissionsAuthHeader
                },
                payload: {
                    name: 'Test Role',
                    organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
                    applicationId: null,
                    permissions: [
                        'ViewUsers'
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 400 with bad payload', async () => { 
            const options = {
                url: '/api/roles',
                method: 'POST',
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

        it('returns 200 with permissions', async () => { 
            const options = {
                url: '/api/roles',
                method: 'POST',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    name: 'Test Role',
                    organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
                    applicationId: null,
                    permissions: [
                        'ViewUsers'
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns a role object', async () => { 
            const options = {
                url: '/api/roles',
                method: 'POST',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    name: 'Test Role',
                    organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
                    applicationId: null,
                    permissions: [
                        'ViewUsers'
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(typeof payload).to.be.equal('object');
            expect(payload.id).not.to.be.equal(undefined);
            expect(payload.name).not.to.be.equal(undefined);
            expect(payload.deleted).not.to.be.equal(undefined);
            expect(payload.organizationId).not.to.be.equal(undefined);
        });
    });

    describe('PUT /roles/{roleId}', () => {
        it('returns 401 with no permissions', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'PUT',
                headers: {
                    'Authorization': noPermissionsAuthHeader
                },
                payload: {
                    name: 'Test Role',
                    permissions: [
                        'ViewUsers'
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 400 with bad role id', async () => { 
            const options = {
                url: '/api/roles/bad-role-id',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    name: 'Test Role',
                    permissions: [
                        'ViewUsers'
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 400 with bad payload', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
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

        it('returns 200 with permissions', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    name: 'Test Role',
                    permissions: [
                        'ViewUsers'
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns a role object', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    name: 'Test Role',
                    permissions: [
                        'ViewUsers'
                    ]
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(typeof payload).to.be.equal('object');
            expect(payload.id).not.to.be.equal(undefined);
            expect(payload.name).not.to.be.equal(undefined);
            expect(payload.deleted).not.to.be.equal(undefined);
            expect(payload.organizationId).not.to.be.equal(undefined);
        });
    });

    describe('DELETE /roles/{roleId}', () => {
        it('returns 401 with no permissions', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'DELETE',
                headers: {
                    'Authorization': noPermissionsAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 400 with bad role id', async () => { 
            const options = {
                url: '/api/roles/bad-role-id',
                method: 'DELETE',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 200 with permissions', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'DELETE',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns a role object', async () => { 
            const options = {
                url: '/api/roles/e37c87b4-b92e-11e8-96f8-529269fb1459',
                method: 'DELETE',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(typeof payload).to.be.equal('object');
            expect(payload.id).not.to.be.equal(undefined);
            expect(payload.name).not.to.be.equal(undefined);
            expect(payload.deleted).to.be.equal(true);
            expect(payload.organizationId).not.to.be.equal(undefined);
        });
    });
});