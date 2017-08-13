const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const boom = require('boom');
const Joi = require('joi');

const AuthHandler = {};
AuthHandler.routes = [];
    
AuthHandler.routes.push({
    method: 'POST',
    path: '/auth/login',
    config: {
        auth: false,
        validate: {
            payload: {
                username: Joi.string().required(),
                password: Joi.string().required()
            }
        }
    },
    handler: login,
    
});

async function login(request, reply) {
    //try {
    //    throw new Error('test');    
    // } catch(err) {
    //     request.server.app.logger.error(err);
    //     return reply(boom.badImplementation(err));
    // }

    request.app.getNewUoW();

    const db = request.server.app.database;

    const user = await db.usersRepository.getUserByUsername(request.payload.username);

    if (user == null || !bcrypt.compareSync(request.payload.password, user.password)) {
        return reply(boom.unauthorized('Authentication failed.'));
    } else {
        const tokenPayload = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        };

        const token = jwt.sign(tokenPayload, request.server.app.jwtKey, {expiresIn: request.server.app.jwtValidTimespan});

        const response = reply({message:'', data:{token: token}});
        response.header("Authorization", `Bearer ${token}`);

        return response;
    }
}

module.exports = AuthHandler;