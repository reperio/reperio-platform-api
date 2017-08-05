const bcrypt = require("bcryptjs");

const routes = [
    {
        method: "GET",
        path: "/auth",
        handler: async (request, reply) => {
            await reply(true);
        }
    },
    {
        method: 'POST',
        path: '/auth',
        config: {auth: false},
        handler: async (request, reply) => {
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
    }
];

module.exports = routes;