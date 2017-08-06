const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const AuthHandler = {};
AuthHandler.routes = [];
    
AuthHandler.routes.push({
    method: 'POST',
    path: '/auth/login',
    config: {auth: false},
    handler: login
});
async function login(request, reply) {
    try {
        throw new Error('test');    
    } catch(err) {
        request.server.app.logger.error(err);
        return reply(null).code(500);
    }
    
    const uow = await request.app.getNewUoW(false);
    const user = await uow.usersRepository.getUserByUsername(request.payload.username);

    if (user == null || !bcrypt.compareSync(request.payload.password, user.password)) {
        await reply(null).code(401);
    } else {
        const tokenPayload = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        };

        const token = jwt.sign(tokenPayload, request.server.app.jwtKey, {expiresIn: request.server.app.jwtValidTimespan});
        request.response.header("Authorization", `Bearer ${token}`);

        await reply({message:'', data:{token: token}});
    }
}

module.exports = AuthHandler;