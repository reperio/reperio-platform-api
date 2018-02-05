const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = [
    {
        method: 'POST',
        path: '/auth/login',
        config: {auth: false},
        handler: async (request, h) => {
            const logger = request.server.app.logger;
            logger.debug(`Auth/Login - ${JSON.stringify(request.payload)}`);
            //const uow = await request.app.getNewUoW();
            //const user = await uow.usersRepository.getUserByEmail(request.payload.email);
            
            const user = {
                id: 'abcd',
                email: 'bradgardner@sevenhillstechnology.com',
                password: '$2a$12$pRM5xSQ5MQp7R8gy9..TBe.x1ZyBcWRSIrPMT5UqboatLi3gaDZUe', //password is 'password'
                isActive: true
            };

            const passwordValid = await bcrypt.compare(request.payload.password, user.password);

            if (user === null || !user.isActive || !passwordValid) {
                const response = h.response('unauthorized');
                response.statusCode = 401;
                return response;
            }
            
            const tokenPayload = {
                userId: user.id,
                userEmail: user.email
            };

            const token = jwt.sign(tokenPayload, request.server.app.config.jsonSecret, {
                expiresIn: '12h'
            });

            return token;
        }
    }
];
