const Hapi = require('hapi');
const accountsRoutes = require('../../api/accounts');
const AccountsRepository = require('../../db/repositories/accountsRepository');
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;

chai.use(sinonChai);

describe('accounts api', () => {
    let server;
    let accountsRepository;

    beforeAll(() => {
        server = new Hapi.Server({ port: 1234, host: '0.0.0.0', routes: {cors: true} });
        server.route(accountsRoutes);

        accountsRepository = new AccountsRepository();

        server.ext({
            type: 'onRequest',
            method: async (request, h) => {
                request.app.getNewUoW = async () => {
                    return {
                        accountsRepository: accountsRepository
                    };
                };

                return h.continue;
            }
        });

        server.app.logger = {
            debug: (msg) => {return;},
            info: (msg) => {return;},
            warn: (msg) => {return;},
            error: (msg, ex) => {return;},
        }
    });

    describe('/billingAccounts/all', () =>{
        it('should exist', async () => {
            const stub = sinon.stub(accountsRepository, 'getAllBillingAccounts').returns(new Promise(function(resolve, reject) {
                resolve([{id:1}, {id:2}]);
            }));
    
            const options = {
                method: "GET",
                url: "/billingAccounts/all"
            };
    
            const response = await server.inject(options);
    
            stub.restore();
            
            expect(response.statusCode).not.to.equal(404, 'route does not exist.')
        });
        
        it('should return accounts', async () => {
            const stub = sinon.stub(accountsRepository, 'getAllBillingAccounts').returns(new Promise(function(resolve, reject) {
                resolve([{id:1}, {id:2}]);
            }));
    
            const options = {
                method: "GET",
                url: "/billingAccounts/all"
            };
    
            const response = await server.inject(options);
    
            stub.restore();

            const payload = JSON.parse(response.payload);
            
            expect(payload.data.length).to.equal(2, 'did not return 2 accounts.')
        })
    })
});