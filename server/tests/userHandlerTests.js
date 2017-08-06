const assert = require('assert');
const sinon = require('sinon');
const should = require('should');
//const AuthHandler = require('../authHandler');
const server = require('../index');

describe('UserHandler', function() {
	describe('#getAllUsers', function() {
		const requestDefaults = {
			method: 'GET',
			url: '/api/users',
			payload: {},
			headers: {}
		};

		it('should respond with 401 if user is not authenticated', async function() {
			const request = Object.assign({}, requestDefaults);
			
			const response = await server.inject(request);

			assert.equal(response.statusCode, 401);
		});

		it('should pass if user is authenticated', async function() {
			this.timeout(5000);
			const request = Object.assign({}, requestDefaults);

			request.headers.Authorization = 'Bearer ' + server.app.config.test_api_token
			
			const usersRepositoryMock = sinon.mock(server.app.database.usersRepository);
			usersRepositoryMock.expects('getAllUsers').once();

			const response = await server.inject(request);

			usersRepositoryMock.verify();
			usersRepositoryMock.restore();

			assert.equal(response.statusCode, 200);
		});
	});
});