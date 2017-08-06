const bcrypt = require("bcryptjs");

const UsersHandler = {};
UsersHandler.routes = [];


UsersHandler.routes.push({
    method: 'GET',
    path:'/users',
    handler: getAllUsers
});

async function getAllUsers(request, reply) {
    const db = request.server.app.database;
    const users = await db.usersRepository.getAllUsers();

    await reply({message: '', data: {users:users}});
}

module.exports = UsersHandler;