const assert = require('assert');
const sinon = require('sinon');
const should = require('should');
//const AuthHandler = require('../authHandler');
const server = require('../index');

describe('AuthHandler', function() {
	describe('#login', function() {
		const requestDefaults = {
			method: 'POST',
			url: '/api/auth/login',
			payload: {}
		};

		it('should respond with 400 if user is not provided', async function() {
			const request = Object.assign({}, requestDefaults);

			request.payload = {
				password: 'password'
			};
			
			const response = await server.inject(request);

			assert.equal(response.statusCode, 400);
		});

		it('should respond with 400 if password is not provided', async function() {
			const request = Object.assign({}, requestDefaults);

			request.payload = {
				username:'adfasdfdsa'
			};
			
			const response = await server.inject(request);

			assert.equal(response.statusCode, 400);
		});

		it('should fail with 401 if the user is not found', async function() {
			this.timeout(5000);
			const request = Object.assign({}, requestDefaults);

			request.payload = {
				username:'adfasdfdsa', 
				password: 'password'
			};
			
			const usersRepositoryMock = sinon.mock(server.app.database.usersRepository);
    		usersRepositoryMock.expects("getUserByUsername").once().returns(null);
			
			const response = await server.inject(request);

			usersRepositoryMock.verify();
			usersRepositoryMock.restore();

			assert.equal(response.statusCode, 401);
		});

		it('should fail with 401 if the password is invalid', async function() {
			this.timeout(5000);
			const request = Object.assign({}, requestDefaults);

			request.payload = {
				username:'admin', 
				password: 'asdfasddf'
			};
			
			const usersRepositoryMock = sinon.mock(server.app.database.usersRepository);
    		usersRepositoryMock.expects("getUserByUsername").once().returns({password:'$2a$12$GsuXWK4R0KpBNExCd7DOwe11O./O46D6jp7LvhMzR.nXIbF0xcArq'});
			
			const response = await server.inject(request);

			usersRepositoryMock.verify();
			usersRepositoryMock.restore();

			assert.equal(response.statusCode, 401);
		});

		it('should pass if user validation passes', async function() {
			this.timeout(5000);
			const request = Object.assign({}, requestDefaults);

			request.payload = {
				username:'admin', 
				password: 'password'
			};
			
			const usersRepositoryMock = sinon.mock(server.app.database.usersRepository);
    		usersRepositoryMock.expects("getUserByUsername").once().returns({password:'$2a$12$GsuXWK4R0KpBNExCd7DOwe11O./O46D6jp7LvhMzR.nXIbF0xcArq'});
			
			const response = await server.inject(request);

			usersRepositoryMock.verify();
			usersRepositoryMock.restore();

			should.exist(response.result.message, 'Response is missing [message] property.');
			should.exist(response.result.data, 'Response is missing [data] property.');
			should.exist(response.result.data.token, 'Token not found on response')
			assert.equal(response.statusCode, 200);
		});
	});
});