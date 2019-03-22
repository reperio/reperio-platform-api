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
    });

    afterEach(async () => {
        await server.server.stop();
        server = null;
    });

    describe('GET /users/exists', () => {

        it('returns 200 with false', async () => {
            const options = {
                url: '/api/users/exists?emailAddress=wrongEmailAddress@mail.com',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
            expect(response.payload).to.be.equal('false');
        });

        it('returns 200 with true', async () => {
            const options = {
                url: '/api/users/exists?emailAddress=support@reper.io',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
            expect(response.payload).to.be.equal('true');
        });

        it('returns 400 since the query param is not an email', async () => {
            const options = {
                url: '/api/users/exists?emailAddress=notValidAddress',
                method: 'GET'
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });
    });
});