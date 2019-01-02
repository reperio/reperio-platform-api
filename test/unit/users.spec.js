const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const expect = chai.expect;

const { extensions } = require('../../extensions');
const mockUoW = require('./mockUoW');
const { createTestServer } = require('./testServer');

chai.use(sinonChai);

describe('Users API', () => {
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

    describe('GET /users/{emailAddress}/emailExists', () => {
        it('returns 401 with no permissions', async () => {
            const options = {
                url: '/api/users/validEmailAddress@mail.com/emailExists',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });

        it('returns 200 with permissions', async () => {
            const options = {
                url: '/api/users/wrongEmailAddress@mail.com/emailExists',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });

        it('returns array of roles', async () => {
            const options = {
                url: '/api/users/invalidAddress/emailExists',
                method: 'GET'
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
});