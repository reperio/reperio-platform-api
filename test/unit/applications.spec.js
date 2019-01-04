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
            const mockGetUserByEmail = sandbox.stub(mockUoW.usersRepository, 'getUserByEmail')
                .returns(null);

            const mockCreateUser = sandbox.stub(mockUoW.usersRepository, 'createUser')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin"
                    }
                );

            const mockEditUser = sandbox.stub(mockUoW.usersRepository, 'editUser')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin"
                    }
                );

            const mockCreateUserEmail = sandbox.stub(mockUoW.userEmailsRepository, 'createUserEmail')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        userId:"7e4d496d-843b-0647-eb86-fad0e85ede72",
                        emailVerified: false,
                        email:"andrewrobb@sevenhillstechnology.com",
                        deleted: false
                    }
                );

            const mockGetOrganizationByOrganizationInformation = sandbox.stub(mockUoW.organizationsRepository, 'getOrganizationByOrganizationInformation')
                .returns([]);

            const mockCreateOrganization = sandbox.stub(mockUoW.organizationsRepository, 'createOrganization')
                .returns(
                    [
                        {
                            name: "New Organization",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockCreatePhone = sandbox.stub(mockUoW.userPhonesRepository, 'createUserPhone')
                .returns(
                    [
                        {
                            phoneNumber: "1234567890",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockProcessMessage = sandbox.stub(mockHelper.messageHelper, 'processMessage')
                .returns(null);

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
                    sendConfirmationEmail: true,
                    confirmationRedirectLink: "https://it.reper.io/surveys/"
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
            expect(mockGetUserByEmail.getCall(0)).to.not.be.null;
            expect(mockGetOrganizationByOrganizationInformation.getCall(0)).to.not.be.null;
            expect(mockCreateOrganization.getCall(0)).to.not.be.null;
            expect(mockCreateUser.getCall(0)).to.not.be.null;
            expect(mockCreatePhone.getCall(0)).to.not.be.null;
            expect(mockCreateUserEmail.getCall(0)).to.not.be.null;
            expect(mockEditUser.getCall(0)).to.not.be.null;
            expect(mockProcessMessage.getCall(0)).to.not.be.null;
        });

        it ('returns 409 with conflict due to existing user', async () => {
            const mockGetUserByEmail = sandbox.stub(mockUoW.usersRepository, 'getUserByEmail')
                .returns(
                    {
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin"
                    }
                );

            const mockCreateUser = sandbox.stub(mockUoW.usersRepository, 'createUser')
                .returns(
                    {
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin"
                    }
                );

            const mockEditUser = sandbox.stub(mockUoW.usersRepository, 'editUser')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin"
                    }
                );

            const mockCreateUserEmail = sandbox.stub(mockUoW.userEmailsRepository, 'createUserEmail')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        userId:"7e4d496d-843b-0647-eb86-fad0e85ede72",
                        emailVerified: false,
                        email:"andrewrobb@sevenhillstechnology.com",
                        deleted: false
                    }
                );

            const mockGetOrganizationByOrganizationInformation = sandbox.stub(mockUoW.organizationsRepository, 'getOrganizationByOrganizationInformation')
                .returns([]);

            const mockCreateOrganization = sandbox.stub(mockUoW.organizationsRepository, 'createOrganization')
                .returns(
                    [
                        {
                            name: "New Organization",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockCreatePhone = sandbox.stub(mockUoW.userPhonesRepository, 'createUserPhone')
                .returns(
                    [
                        {
                            phoneNumber: "1234567890",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockProcessMessage = sandbox.stub(mockHelper.messageHelper, 'processMessage')
                .returns(null);

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
                    sendConfirmationEmail: false,
                    confirmationRedirectLink: "https://it.reper.io/surveys/"
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(409);
            expect(mockGetUserByEmail.getCall(0)).to.not.be.null;
            expect(mockGetOrganizationByOrganizationInformation.getCall(0)).to.be.null;
            expect(mockCreateOrganization.getCall(0)).to.be.null;
            expect(mockCreateUser.getCall(0)).to.be.null;
            expect(mockCreatePhone.getCall(0)).to.be.null;
            expect(mockCreateUserEmail.getCall(0)).to.be.null;
            expect(mockEditUser.getCall(0)).to.be.null;
            expect(mockProcessMessage.getCall(0)).to.be.null;
        });

        it ('returns 409 with conflict due to existing organization', async () => {
            const mockGetUserByEmail = sandbox.stub(mockUoW.usersRepository, 'getUserByEmail')
                .returns(null);

            const mockCreateUser = sandbox.stub(mockUoW.usersRepository, 'createUser')
                .returns({
                    primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                    firstName: "admin",
                    lastName: "admin"
                });

            const mockEditUser = sandbox.stub(mockUoW.usersRepository, 'editUser')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin"
                    }
                );

            const mockCreateUserEmail = sandbox.stub(mockUoW.userEmailsRepository, 'createUserEmail')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        userId:"7e4d496d-843b-0647-eb86-fad0e85ede72",
                        emailVerified: false,
                        email:"andrewrobb@sevenhillstechnology.com",
                        deleted: false
                    }
                );

            const mockGetOrganizationByOrganizationInformation = sandbox.stub(mockUoW.organizationsRepository, 'getOrganizationByOrganizationInformation')
                .returns(
                    [
                        {
                            name: "Existing Organization"
                        }
                    ]
                );

            const mockCreateOrganization = sandbox.stub(mockUoW.organizationsRepository, 'createOrganization')
                .returns(
                    [
                        {
                            name: "New Organization",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockCreatePhone = sandbox.stub(mockUoW.userPhonesRepository, 'createUserPhone')
                .returns(
                    [
                        {
                            phoneNumber: "1234567890",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockProcessMessage = sandbox.stub(mockHelper.messageHelper, 'processMessage')
                .returns(null);

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
                    sendConfirmationEmail: false,
                    confirmationRedirectLink: "https://it.reper.io/surveys/"
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(409);
            expect(mockGetUserByEmail.getCall(0)).to.not.be.null;
            expect(mockGetOrganizationByOrganizationInformation.getCall(0)).to.not.be.null;
            expect(mockCreateOrganization.getCall(0)).to.be.null;
            expect(mockCreateUser.getCall(0)).to.be.null;
            expect(mockCreatePhone.getCall(0)).to.be.null;
            expect(mockCreateUserEmail.getCall(0)).to.be.null;
            expect(mockEditUser.getCall(0)).to.be.null;
            expect(mockProcessMessage.getCall(0)).to.be.null;
        });

        it ('returns 200 and creates multiple organizations', async () => {
            const mockGetUserByEmail = sandbox.stub(mockUoW.usersRepository, 'getUserByEmail')
                .returns(null);

            const mockCreateUser = sandbox.stub(mockUoW.usersRepository, 'createUser')
                .returns({
                    primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                    firstName: "admin",
                    lastName: "admin"
                });

            const mockEditUser = sandbox.stub(mockUoW.usersRepository, 'editUser')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin"
                    }
                );

            const mockCreateUserEmail = sandbox.stub(mockUoW.userEmailsRepository, 'createUserEmail')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        userId:"7e4d496d-843b-0647-eb86-fad0e85ede72",
                        emailVerified: false,
                        email:"andrewrobb@sevenhillstechnology.com",
                        deleted: false
                    }
                );

            const mockGetOrganizationByOrganizationInformation = sandbox.stub(mockUoW.organizationsRepository, 'getOrganizationByOrganizationInformation')
                .returns([]);

            const mockCreateOrganization = sandbox.stub(mockUoW.organizationsRepository, 'createOrganization')
                .returns(
                    [
                        {
                            name: "New Organization",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockCreatePhone = sandbox.stub(mockUoW.userPhonesRepository, 'createUserPhone')
                .returns(
                    [
                        {
                            phoneNumber: "1234567890",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockProcessMessage = sandbox.stub(mockHelper.messageHelper, 'processMessage')
                .returns(null);

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
                            name: "New Organization 1",
                            streetAddress: "123 street",
                            suiteNumber: "1",
                            city: "city",
                            state: "state",
                            zip: "12345"
                        },
                        {
                            name: "New Organization 2",
                            streetAddress: "123 street",
                            suiteNumber: "1",
                            city: "city",
                            state: "state",
                            zip: "12345"
                        }
                    ],
                    sendConfirmationEmail: false,
                    confirmationRedirectLink: "https://it.reper.io/surveys/"
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
            expect(mockGetUserByEmail.getCall(0)).to.not.be.null;
            expect(mockGetOrganizationByOrganizationInformation.getCall(0)).to.not.be.null;
            expect(mockCreateOrganization.getCall(0)).to.not.be.null;
            expect(mockCreateOrganization.getCall(1)).to.not.be.null;
            expect(mockCreateUser.getCall(0)).to.not.be.null;
            expect(mockCreatePhone.getCall(0)).to.not.be.null;
            expect(mockCreateUserEmail.getCall(0)).to.not.be.null;
            expect(mockEditUser.getCall(0)).to.not.be.null;
            expect(mockProcessMessage.getCall(0)).to.be.null;
        });

        it ('returns 200 and creates multiple phones', async () => {
            const mockGetUserByEmail = sandbox.stub(mockUoW.usersRepository, 'getUserByEmail')
                .returns(null);

            const mockCreateUser = sandbox.stub(mockUoW.usersRepository, 'createUser')
                .returns({
                    primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                    firstName: "admin",
                    lastName: "admin"
                });

            const mockEditUser = sandbox.stub(mockUoW.usersRepository, 'editUser')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        primaryEmailAddress: "andrewrobb@sevenhillstechnology.com",
                        firstName: "admin",
                        lastName: "admin"
                    }
                );

            const mockCreateUserEmail = sandbox.stub(mockUoW.userEmailsRepository, 'createUserEmail')
                .returns(
                    {
                        id: "7e4d496d-843b-0647-eb86-fad0e85ede72",
                        userId:"7e4d496d-843b-0647-eb86-fad0e85ede72",
                        emailVerified: false,
                        email:"andrewrobb@sevenhillstechnology.com",
                        deleted: false
                    }
                );

            const mockGetOrganizationByOrganizationInformation = sandbox.stub(mockUoW.organizationsRepository, 'getOrganizationByOrganizationInformation')
                .returns([]);

            const mockCreateOrganization = sandbox.stub(mockUoW.organizationsRepository, 'createOrganization')
                .returns(
                    [
                        {
                            name: "New Organization",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockCreatePhone = sandbox.stub(mockUoW.userPhonesRepository, 'createUserPhone')
                .returns(
                    [
                        {
                            phoneNumber: "1234567890",
                            id:"7e4d496d-843b-0647-eb86-fad0e85ede72"
                        }
                    ]
                );

            const mockProcessMessage = sandbox.stub(mockHelper.messageHelper, 'processMessage')
                .returns(null);

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
                        },
                        {
                            phoneNumber: "1234567890",
                            phoneType: "cell"
                        }
                    ],
                    organizations:[
                        {
                            name: "New Organization 1",
                            streetAddress: "123 street",
                            suiteNumber: "1",
                            city: "city",
                            state: "state",
                            zip: "12345"
                        },
                        {
                            name: "New Organization 2",
                            streetAddress: "123 street",
                            suiteNumber: "1",
                            city: "city",
                            state: "state",
                            zip: "12345"
                        }
                    ],
                    sendConfirmationEmail: false,
                    confirmationRedirectLink: "https://it.reper.io/surveys/"
                }
            };

            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
            expect(mockGetUserByEmail.getCall(0)).to.not.be.null;
            expect(mockGetOrganizationByOrganizationInformation.getCall(0)).to.not.be.null;
            expect(mockCreateOrganization.getCall(0)).to.not.be.null;
            expect(mockCreateOrganization.getCall(1)).to.not.be.null;
            expect(mockCreateUser.getCall(0)).to.not.be.null;
            expect(mockCreatePhone.getCall(0)).to.not.be.null;
            expect(mockCreatePhone.getCall(1)).to.not.be.null;
            expect(mockCreateUserEmail.getCall(0)).to.not.be.null;
            expect(mockEditUser.getCall(0)).to.not.be.null;
            expect(mockProcessMessage.getCall(0)).to.be.null;
        });
    });
});