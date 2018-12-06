const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const expect = chai.expect;

const { extensions } = require('../../extensions');
const mockUoW = require('./mockUoW');
const { createTestServer, adminAuthHeader, noPermissionsAuthHeader } = require('./testServer');

chai.use(sinonChai);

describe('Organizations API', () => {
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

    // POST /organizations
    describe('POST /organizations', () => {
        it ('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/organizations',
                method: 'POST',
                payload: {
                    name: 'Test Org 3',
                    userIds: ['d08a1f76-7c4a-4dd9-a377-83ffffa752f4'],
                    personal: false
                },
                headers: {
                    'Authorization': noPermissionsAuthHeader
                }
            };
            
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it ('returns 400 with incorrect payload', async () => {
            const options = {
                url: '/api/organizations',
                method: 'POST',
                payload: {
                    bad: 'payload'
                },
                headers: {
                    'Authorization': adminAuthHeader
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });
    
        it ('returns 200 with correct payload', async () => {
            const options = {
                url: '/api/organizations',
                method: 'POST',
                payload: {
                    name: 'Test Org 3',
                    userIds: ['d08a1f76-7c4a-4dd9-a377-83ffffa752f4'],
                    personal: false
                },
                headers: {
                    'Authorization': adminAuthHeader
                }
            };
            
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
            const payload = JSON.parse(response.payload);
            expect(payload.name).to.be.equal(options.payload.name);
            expect(payload.personal).to.be.equal(options.payload.personal);
        });

        it('calls replaceUserOrganizationsByOrganizationId with provided user ids', async () => {
            const spy = sinon.spy();
            mockUoW.usersRepository.replaceUserOrganizationsByOrganizationId = spy;

            const options = {
                url: '/api/organizations',
                method: 'POST',
                payload: {
                    name: 'Test Org 3',
                    userIds: ['d08a1f76-7c4a-4dd9-a377-83ffffa752f4'],
                    personal: false
                },
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            const payload = JSON.parse(response.payload);
            expect(spy).calledWith(payload.id, options.payload.userIds);
        });
    });
    
    // DELETE /organizations/{organizationId}
    describe('DELETE /organizations/{organizationId}', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/organizations/966f4157-934c-45e7-9f44-b1e5fd8b79a7',
                method: 'DELETE'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 401 with bad payload', async () => {
            const options = {
                url: '/api/organizations/bad-org-id',
                method: 'DELETE',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 200 with correct payload', async () => {
            const options = {
                url: '/api/organizations/966f4157-934c-45e7-9f44-b1e5fd8b79a7',
                method: 'DELETE',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });
    });

    // GET /organizations
    describe('GET /organizations', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/organizations',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 200 with permissions', async () => {
            const options = {
                url: '/api/organizations',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns array of organizations', async () => {
            const options = {
                url: '/api/organizations',
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
            expect(payload[0].personal).not.to.be.equal(undefined);
            expect(payload[0].deleted).not.to.be.equal(undefined);
            expect(payload[0].id).not.to.be.equal(undefined);
        });
    });

    // GET /organizations/user/{userId}
    describe('GET /organizations/user/{userId}', () => {
        it('returns 400 with bad user id', async () => {
            const options = {
                url: '/api/organizations/user/bad-user-id',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 200', async () => {
            const options = {
                url: '/api/organizations/user/d08a1f76-7c4a-4dd9-a377-83ffffa752f4',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns array of organizations', async () => {
            const options = {
                url: '/api/organizations/user/d08a1f76-7c4a-4dd9-a377-83ffffa752f4',
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
            expect(payload[0].personal).not.to.be.equal(undefined);
            expect(payload[0].deleted).not.to.be.equal(undefined);
            expect(payload[0].id).not.to.be.equal(undefined);
        });
    });

    // GET /organizations/{organizationId}
    describe('GET /organizations/{organizationId}', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/organizations/bad-org-id',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 400 with bad org id', async () => {
            const options = {
                url: '/api/organizations/bad-org-id',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it('returns 200', async () => {
            const options = {
                url: '/api/organizations/d08a1f76-7c4a-4dd9-a377-83ffffa752f4',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns organization object', async () => {
            const options = {
                url: '/api/organizations/d08a1f76-7c4a-4dd9-a377-83ffffa752f4',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(payload.name).not.to.be.equal(undefined);
            expect(payload.personal).not.to.be.equal(undefined);
            expect(payload.deleted).not.to.be.equal(undefined);
            expect(payload.id).not.to.be.equal(undefined);
        });
    });

    // PUT /organizations/{organizationId}
    describe('PUT /organizations/{organizationId}', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/organizations/bad-org-id',
                method: 'PUT'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 400 with bad org id', async () => {
            const options = {
                url: '/api/organizations/bad-org-id',
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
                url: '/api/organizations/d08a1f76-7c4a-4dd9-a377-83ffffa752f4',
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
                url: '/api/organizations/d08a1f76-7c4a-4dd9-a377-83ffffa752f4',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    name: 'Test Org 3',
                    userIds: ['d08a1f76-7c4a-4dd9-a377-83ffffa752f4']
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns organization object', async () => {
            const options = {
                url: '/api/organizations/d08a1f76-7c4a-4dd9-a377-83ffffa752f4',
                method: 'PUT',
                headers: {
                    'Authorization': adminAuthHeader
                },
                payload: {
                    name: 'Test Org 3',
                    userIds: ['d08a1f76-7c4a-4dd9-a377-83ffffa752f4']
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);

            const payload = JSON.parse(response.payload);
            expect(payload.name).not.to.be.equal(undefined);
            expect(payload.personal).not.to.be.equal(undefined);
            expect(payload.deleted).not.to.be.equal(undefined);
            expect(payload.id).not.to.be.equal(undefined);
        });
    });
});