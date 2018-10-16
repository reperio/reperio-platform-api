// const ReperioServer = require('hapijs-starter');
// const Config = require('../../config');
// const API = require('../../api');
// const chai = require("chai");
// const sinon = require("sinon");
// const sinonChai = require("sinon-chai");
// const UnitOfWork = require('../../db');
// const expect = chai.expect;

// chai.use(sinonChai);

// describe('users api', async () => {
//     let server;

//     beforeAll(async () => {
//         server = new ReperioServer({
//             statusMonitor: true,
//             cors: true,
//             corsOrigins: ['*'],
//             authEnabled: true,
//             authSecret: Config.jsonSecret
//         });

//         const apiPluginPackage = {
//             plugin: API,
//             options: {},
//             routes: {
//                 prefix: '/api'
//             }
//         };

//         await server.registerAdditionalPlugin(apiPluginPackage);

//         server.app.logger = {
//             debug: (msg) => {return;},
//             info: (msg) => {return;},
//             warn: (msg) => {return;},
//             error: (msg, ex) => {return;},
//         }

//         await server.registerExtension({
//             type: 'onRequest',
//             method: async (request, h) => {
//                 request.app.uows = [];
        
//                 request.app.getNewUoW = async () => {
//                     const uow = new UnitOfWork(server.app.logger);
//                     request.app.uows.push(uow);
//                     return uow;
//                 };
              
//                 request.app.getNewRecaptcha = async () => {
//                     const recaptcha = new RecaptchaService('https://www.google.com/recaptcha/api/siteverify', server.app.logger);
//                     return recaptcha;
//                 };

//                 request.app.getNewMessageHelper = async () => {
//                     return new MessageHelper(server.app.logger, Config);
//                 };

//                 return h.continue;
//             }
//         });

//         await server.registerExtension({
//             type: "onPostAuth",
//             method: async (request, h) => {
//                 if (request.auth.isAuthenticated) {
//                     request.app.currentUserId = request.auth.credentials.currentUserId;
//                 }
    
//                 return h.continue;
//             }
//         });

//         await server.registerExtension({
//             type: "onPreResponse",
//             method: async (request, h) => {
    
//                 if (request.app.currentUserId != null && request.response.header != null) {

//                     const tokenPayload = {
//                         currentUserId: request.app.currentUserId
//                     };
                
//                     const token = jwt.sign(tokenPayload, Config.jsonSecret, {
//                         expiresIn: Config.jwtValidTimespan
//                     });

//                     request.response.header('Access-Control-Expose-Headers', 'Authorization');
//                     request.response.header("Authorization", `Bearer ${token}`);
//                 }
    
//                 return h.continue;
//             }
//         });
//     });

//     describe('/users', () =>{
//         it('should exist', async () => {

//             const options = {
//                 method: "GET",
//                 url: "/api/users/d08a1f76-7c4a-4dd9-a377-83ffffa752f4"
//             };
    
//             const response = await server.server.inject(options);
            
//             expect(response.result.id).to.equal('d08a1f76-7c4a-4dd9-a377-83ffffa752f4', 'did not return user.')
//         });

//         it('should exist', async () => {

//             const options = {
//                 method: "GET",
//                 url: "/api/users"
//             };
    
//             const response = await server.server.inject(options);
            
//             expect(response.result.length).to.not.equal(0, 'did not return users.')
//         });

//         it('should exist', async () => {

//             const payload = {
//                 firstName: 'testUser',
//                 lastName: 'testUser',
//                 password: 'testPassword',
//                 confirmPassword: 'testPassword',
//                 primaryEmailAddress: 'test@test.com',
//                 organizationIds: []
//             };

//             const options = {
//                 method: "POST",
//                 url: "/api/users",
//                 body: JSON.stringify(payload)
//             };
    
//             const response = await server.server.inject(options);
            
//             expect(response.result).to.not.equal(null, 'did not create user.')
//         });

//         it('should exist', async () => {

//             const payload = {
//                 firstName: 'testUser',
//                 lastName: 'testUser',
//                 password: 'testPassword',
//                 confirmPassword: 'testPassword',
//                 primaryEmailAddress: 'test@test.com',
//                 organizationIds: []
//             };

//             const options = {
//                 method: "POST",
//                 url: "/api/users",
//                 body: JSON.stringify(payload)
//             };
    
//             const response = await server.server.inject(options);
            
//             expect(response.result).to.not.equal(null, 'did not create user.')
//         });

//         it('should exist', async () => {

//             const payload = {
//                 firstName: 'testUser',
//                 lastName: 'testUser',
//                 password: 'testPassword',
//                 confirmPassword: 'testPassword',
//                 primaryEmailAddress: 'test@test.com',
//                 organizationIds: []
//             };

//             const options = {
//                 method: "POST",
//                 url: "/api/users",
//                 body: JSON.stringify(payload)
//             };
    
//             const response = await server.server.inject(options);
            
//             expect(response.result).to.not.equal(null, 'did not create user.')
//         });

//         it('should exist', async () => {
//             await knex.seed.run(knexConfig);
//             const payload = {
//                 firstName: 'testUser',
//                 lastName: 'testUser',
//                 password: 'testPassword',
//                 confirmPassword: 'testPassword',
//                 primaryEmailAddress: 'test@test.com',
//                 organizationIds: []
//             };

//             const options = {
//                 method: "POST",
//                 url: "/api/users",
//                 body: JSON.stringify(payload)
//             };
    
//             const response = await server.server.inject(options);
            
//             expect(response.result).to.not.equal(null, 'did not create user.')
//         });

//         //await knex.seed.run(knexConfig);
//     })
// });