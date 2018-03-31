const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    async validatePassword(password, hash) {
        const valid = await bcrypt.compare(password, hash);
    
        return valid;
    }
    
    getAuthToken(user, secret) {
        const tokenPayload = {
            currentUserId: user.id,
            userId: user.id,
            userEmail: user.email
        };
    
        const token = jwt.sign(tokenPayload, secret, {
            expiresIn: '12h'
        });
    
        return token;
    }
}

module.exports = AuthService;
