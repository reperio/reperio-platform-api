const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
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
    
        return response;
    }
}

module.exports = AuthService;
