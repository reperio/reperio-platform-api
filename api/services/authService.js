const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PermissionService = require('./permissionService');

class AuthService {
    async validatePassword(password, hash) {
        const valid = await bcrypt.compare(password, hash);
    
        return valid;
    }
    
    getAuthToken(user, secret, jwtValidTimespan) {
        const tokenPayload = {
            currentUserId: user.id,
            userId: user.id,
            userEmail: user.primaryEmailAddress,
            userPermissions: PermissionService.getUserPermissions(user)
        };
    
        const token = jwt.sign(tokenPayload, secret, {
            expiresIn: jwtValidTimespan
        });
    
        return token;
    }

    async hashPassword(password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        return hashedPassword;
    }
}

const authService = new AuthService();

module.exports = authService;
