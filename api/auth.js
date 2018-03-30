const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');

function unauthorized(h) {
    const response = h.response('unauthorized');
    response.statusCode = 401;
    return response;
}

function loginSuccess(h, token) {
    const response = h.response();
    response.header('Authorization', `Bearer ${token}`);
    response.header('Access-Control-Expose-Headers', 'Authorization');

    return response;
}

async function validatePassword(password, hash) {
    const valid = await bcrypt.compare(password, hash);

    return valid;
}

function getAuthToken(user, secret) {
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

module.exports = [
    {
        method: 'POST',
        path: '/auth/login',
        handler: async (request, h) => {
            const logger = request.server.app.logger;
            try {
                logger.debug(`Auth/Login - ${JSON.stringify(request.payload)}`);
                const uow = await request.app.getNewUoW();

                const user = await uow.usersRepository.getUserByEmail(request.payload.email);

                if (!user || !validatePassword(request.payload.password, user.password)) {
                    return unauthorized(h);
                }

                const token = getAuthToken(user, request.server.app.config.jsonSecret);

                return loginSuccess(h, token);
            } catch (err) {
                logger.error(err);
                return unauthorized(h);
            }
        },
        options: {
            auth: false,
            validate: {
                payload: {
                    email: Joi.string().required(),
                    password: Joi.string().required()
                }
            }
        }
    }
];
