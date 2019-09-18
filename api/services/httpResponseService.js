const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class HttpResponseService {
    unauthorized(h) {
        const response = h.response('unauthorized');
        response.statusCode = 401;
        return response;
    }

    badData(h) {
        const response = h.response('bad data');
        response.statusCode = 400;
        return response;
    }
    
    loginSuccess(h, token) {
        const response = h.response();
        response.header('Authorization', `Bearer ${token}`);
        response.header('Access-Control-Expose-Headers', 'Authorization');
        response.state('token', token);
    
        return response;
    }

    logoutSuccess(h) {
        const response = h.response('');
        response.statusCode = 204;
        response.unstate('token');
    
        return response;
    }

    conflict(h) {
        const response = h.response('conflict');
        response.statusCode = 409;
        return response;
    }
}

const httpResponseService = new HttpResponseService();

module.exports = httpResponseService;
