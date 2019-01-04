const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const expect = chai.expect;

const { extensions } = require('../../extensions');
const mockUoW = require('./mockUoW');
const mockHelper = require('./mockHelper');
const { createTestServer, adminAuthHeader } = require('./testServer');

chai.use(sinonChai);


describe('Applications API', () => {
    let server = null;

    beforeEach(async () => {
        server = await createTestServer();

        await server.registerExtension({
            type: 'onPreHandler',
            method: async (request, h) => {
                request.app.uows = [];
                request.app.getNewUoW = async () => {
                    request.app.uows.push(mockUoW);
                    return mockUoW;
                };

                request.app.getNewRedisHelper = async () => {
                    return mockHelper.redisHelper;
                };

                request.app.getNewMessageHelper = async () => {
                    return mockHelper.messageHelper;
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

    // POST /applications/{applicationId}/userSignup
    describe('POST api/applications/{applicationId}/userSignup', () => {
        let sandbox;
        beforeAll(() => {
            sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
            sandbox.restore();
            sandbox.reset();
        });

        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/applications/123456/userSignup',
                method: 'POST',
                payload: {
                    firstName:"admin",
                    lastName:"admin"
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 200 with correct payload', async () => {
            const mockCreateUser = jest.spyOn(mockUoW.usersRepository, "createUser");
            const mockEditUser = jest.spyOn(mockUoW.usersRepository, "editUser");
            const mockCreateUserEmail = jest.spyOn(mockUoW.userEmailsRepository, "createUserEmail");
            const mockGetOrganizationByOrganizationInformation = sandbox.stub(mockUoW.organizationsRepository, 'getOrganizationByOrganizationInformation')
                .returns([]);
            const mockCreateOrganizations = jest.spyOn(mockUoW.organizationsRepository, "createOrganization");
            const mockCreatePhones = jest.spyOn(mockUoW.userPhonesRepository, "createUserPhone");
            const mockProcessMessage = jest.spyOn(mockHelper.messageHelper, "processMessage");

            try {
                const options = {
                    url: '/api/applications/d08a1f76-7c4a-4dd9-a377-83ffffa752f4/userSignup',
                    method: 'POST',
                    payload: {
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin",
                        phones:[
                            {
                                phoneNumber: "1234567890",
                                phoneType: "home"
                            }
                        ],
                        organizations:[
                            {
                                name: "1234567890",
                                streetAddress: "123 street",
                                suiteNumber: "1",
                                city: "city",
                                state: "state",
                                zip: "12345"
                            }
                        ],
                        sendConfirmationEmail: false
                    }
                };

                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockCreateUser.mock.calls.length).to.be.equal(1);
                expect(mockEditUser.mock.calls.length).to.be.equal(1);
                expect(mockCreateUserEmail.mock.calls.length).to.be.equal(1);
                expect(mockGetOrganizationByOrganizationInformation.getCall(0)).to.not.be.null;
                expect(mockCreateOrganizations.mock.calls.length).to.be.equal(1);
                expect(mockCreatePhones.mock.calls.length).to.be.equal(1);
                expect(mockProcessMessage.mock.calls.length).to.be.equal(1);
            } finally {
                mockCreateUser.mockRestore();
                mockEditUser.mockRestore();
                mockCreateUserEmail.mockRestore();
                mockCreateOrganizations.mockRestore();
                mockCreatePhones.mockRestore();
                mockProcessMessage.mockRestore();
            }
        });
    });
});