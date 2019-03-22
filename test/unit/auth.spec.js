const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const expect = chai.expect;

const { extensions } = require('../../extensions');
const mockUoW = require('./mockUoW');
const mockHelper = require('./mockHelper');
const { createTestServer, adminAuthHeader } = require('./testServer');

chai.use(sinonChai);


describe('Auth API', () => {
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
    });

    afterEach(async () => {
        await server.server.stop();
        server = null;
    });

    // GET /auth
    describe('GET api/auth', () => {
        it ('returns 200', async () => {
            const options = {
                url: '/api/auth',
                method: 'GET',
                headers: {
                    'Authorization': adminAuthHeader
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });
    });

    // POST /auth/login
    describe('POST api/auth/login', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/login',
                method: 'POST',
                payload: {
                    password: ''
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 401 with invalid credentials', async () => {
            const options = {
                url: '/api/auth/login',
                method: 'POST',
                payload: {
                    primaryEmailAddress: 'support@reper.io',
                    password: 'password1'
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(401);
        });
    
        it ('returns 200 with correct payload', async () => {
            const mockGetUser = jest.spyOn(mockUoW.usersRepository, "getUserByEmail")
            
            try {
                const options = {
                    url: '/api/auth/login',
                    method: 'POST',
                    payload: {
                        primaryEmailAddress: 'support@reper.io',
                        password: 'password'
                    }
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockGetUser.mock.calls.length).to.be.equal(1);
            } finally {
                mockGetUser.mockRestore();
            }
        });  
    });

    // POST /auth/otp
    describe('POST api/auth/otp', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/otp',
                method: 'POST',
                payload: {
                    otp: true
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 200 with correct payload', async () => {
            const mockGetJWTForOTP = jest.spyOn(mockHelper.redisHelper, "getJWTForOTP")
            
            try {
                const options = {
                    url: '/api/auth/otp',
                    method: 'POST',
                    payload: {
                        otp: 'test'
                    }
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockGetJWTForOTP.mock.calls.length).to.be.equal(1);
            } finally {
                mockGetJWTForOTP.mockRestore();
            }
        });  
    });

    // POST /auth/otp/generate
    describe('POST api/auth/otp/generate', () => {
        it ('returns 200 with correct payload', async () => {
            const mockAddOTP = jest.spyOn(mockHelper.redisHelper, "addOTP")
            
            try {
                const options = {
                    url: '/api/auth/otp/generate',
                    method: 'POST',
                    headers: {
                        'Authorization': adminAuthHeader
                    }
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockAddOTP.mock.calls.length).to.be.equal(1);
            } finally {
                mockAddOTP.mockRestore();
            }
        });  
    });

    // POST /auth/signup
    describe('POST api/auth/signup', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/signup',
                method: 'POST',
                payload: {
                    firstName: 'test',
                    lastName: 'name',
                    primaryEmailAddress: 'test@test.com',
                    password2: 'test',
                    confirmPassword: 'test'
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/signup',
                method: 'POST',
                payload: {
                    firstName: 'test',
                    lastName: 'name',
                    primaryEmailAddress: 'test@test.com',
                    password: 'test',
                    confirmPassword: 'test2'
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 409 with duplicate primaryEmailAddress', async () => {
            const options = {
                url: '/api/auth/signup',
                method: 'POST',
                payload: {
                    firstName: 'test',
                    lastName: 'name',
                    primaryEmailAddress: 'support@reper.io',
                    password: 'test',
                    confirmPassword: 'test'
                }
            };
            
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(409);
        });  

        it ('returns 200 with correct payload', async () => {
            const mockGetUser = jest.spyOn(mockUoW.usersRepository, "getUserByEmail");
            const mockCreateOrganization = jest.spyOn(mockUoW.organizationsRepository, "createOrganization")
            
            try {
                const options = {
                    url: '/api/auth/signup',
                    method: 'POST',
                    payload: {
                        firstName: 'test',
                        lastName: 'name',
                        primaryEmailAddress: 'test@test.com',
                        password: 'test',
                        confirmPassword: 'test'
                    }
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockGetUser.mock.calls.length).to.be.equal(1);
                expect(mockCreateOrganization.mock.calls.length).to.be.equal(1);
            } finally {
                mockGetUser.mockRestore();
                mockCreateOrganization.mockRestore();
            }
        });  
    });

    // POST /auth/sendVerificationEmail
    describe('POST api/auth/sendVerificationEmail', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/sendVerificationEmail',
                method: 'POST',
                payload: {
                    email: 'test@test.com',
                    userId: true
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 200 with correct payload', async () => {
            const mockGetUser = jest.spyOn(mockUoW.userEmailsRepository, "getUserEmail");
            const mockProcessMessage = jest.spyOn(mockHelper.messageHelper, "processMessage");
            const mockAddEntry = jest.spyOn(mockUoW.emailVerificationsRepository, "addEntry");
            
            try {
                const options = {
                    url: '/api/auth/sendVerificationEmail',
                    method: 'POST',
                    payload: {
                        email: 'test@test.com',
                        userId: '7e4d496d-843b-0647-eb86-fad0e85ede73'
                    }
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockGetUser.mock.calls.length).to.be.equal(1);
                expect(mockProcessMessage.mock.calls.length).to.be.equal(1);
                expect(mockAddEntry.mock.calls.length).to.be.equal(1);
            } finally {
                mockGetUser.mockRestore();
                mockProcessMessage.mockRestore();
                mockAddEntry.mockRestore();
            }
        });  
    });

    // POST /auth/recaptcha
    describe('POST api/auth/recaptcha', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/recaptcha',
                method: 'POST',
                payload: {
                    bad: true
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 200 with correct payload', async () => {
            const options = {
                url: '/api/auth/recaptcha',
                method: 'POST',
                payload: {
                    response: 'test'
                }
            };
            
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(200);
        });  
    });

    // POST /auth/emailVerification
    describe('POST api/auth/emailVerification', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/emailVerification',
                method: 'POST',
                payload: {
                    bad: true
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 200 with correct payload', async () => {
            const mockGetEntry = jest.spyOn(mockUoW.emailVerificationsRepository, "getEntry");
            const mockTrigger = jest.spyOn(mockUoW.emailVerificationsRepository, "trigger");
            const mockVerifyUserEmail = jest.spyOn(mockUoW.usersRepository, "verifyUserEmail");
            
            try {
                const options = {
                    url: '/api/auth/emailVerification',
                    method: 'POST',
                    payload: {
                        token: '7e4d496d-843b-0647-eb86-fad0e85ede73'
                    }
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockGetEntry.mock.calls.length).to.be.equal(1);
                expect(mockTrigger.mock.calls.length).to.be.equal(1);
                expect(mockVerifyUserEmail.mock.calls.length).to.be.equal(1);
            } finally {
                mockGetEntry.mockRestore();
                mockTrigger.mockRestore();
                mockVerifyUserEmail.mockRestore();
            }
        });  
    });

    // POST /auth/forgotPassword
    describe('POST api/auth/forgotPassword', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/forgotPassword',
                method: 'POST',
                payload: {
                    primaryEmailAddress: true
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 200 with correct payload', async () => {
            const mockGetUser = jest.spyOn(mockUoW.usersRepository, "getUserByEmail");
            const mockGetUserEmail = jest.spyOn(mockUoW.userEmailsRepository, "getUserEmail");
            const mockAddEntry = jest.spyOn(mockUoW.forgotPasswordsRepository, "addEntry");
            const mockProcessMessage = jest.spyOn(mockHelper.messageHelper, "processMessage");
            
            try {
                const options = {
                    url: '/api/auth/forgotPassword',
                    method: 'POST',
                    payload: {
                        primaryEmailAddress: 'support@reper.io'
                    }
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockGetUser.mock.calls.length).to.be.equal(1);
                expect(mockGetUserEmail.mock.calls.length).to.be.equal(1);
                expect(mockAddEntry.mock.calls.length).to.be.equal(1);
                expect(mockProcessMessage.mock.calls.length).to.be.equal(1);
            } finally {
                mockGetUser.mockRestore();
                mockGetUserEmail.mockRestore();
                mockAddEntry.mockRestore();
                mockProcessMessage.mockRestore();
            }
        });  
    });

    // GET /auth/resetPassword{token}
    describe('POST api/auth/resetPassword{token}', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/resetPassword/true',
                method: 'GET'
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 200 with correct payload', async () => {
            const mockGetEntry = jest.spyOn(mockUoW.forgotPasswordsRepository, "getEntry");
            
            try {
                const options = {
                    url: '/api/auth/resetPassword/7e4d496d-843b-0647-eb86-fad0e85ede74',
                    method: 'GET'
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockGetEntry.mock.calls.length).to.be.equal(1);
            } finally {
                mockGetEntry.mockRestore();
            }
        });  
    });

    // POST /auth/resetPassword
    describe('POST api/auth/resetPassword', () => {
        it ('returns 400 with invalid payload', async () => {
            const options = {
                url: '/api/auth/resetPassword',
                method: 'POST',
                payload: {
                    token: false,
                    password: '',
                    confirmPassword: ''
                }
            };
    
            const response = await server.server.inject(options);
            expect(response.statusCode).to.be.equal(400);
        });

        it ('returns 200 with correct payload', async () => {
            const mockGetEntry = jest.spyOn(mockUoW.forgotPasswordsRepository, "getEntry");
            const mockTrigger = jest.spyOn(mockUoW.forgotPasswordsRepository, "trigger");
            const mockEdit = jest.spyOn(mockUoW.usersRepository, "editUser");
            
            try {
                const options = {
                    url: '/api/auth/resetPassword',
                    method: 'POST',
                    payload: {
                        token: '7e4d496d-843b-0647-eb86-fad0e85ede74',
                        password: 'test',
                        confirmPassword: 'test'
                    }
                };
                
                const response = await server.server.inject(options);
                expect(response.statusCode).to.be.equal(200);
                expect(mockGetEntry.mock.calls.length).to.be.equal(1);
                expect(mockTrigger.mock.calls.length).to.be.equal(1);
                expect(mockEdit.mock.calls.length).to.be.equal(1);
            } finally {
                mockGetEntry.mockRestore();
                mockTrigger.mockRestore();
                mockEdit.mockRestore();
            }
        });  
    });
});