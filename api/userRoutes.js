const bcrypt = require("bcryptjs");

const UsersHandler = {};
UsersHandler.routes = [];


UsersHandler.routes.push({
    method: 'GET',
    path:'/users',
    handler: getAllUsers
}
async function getAllUsers(request, reply) {
    const uow = await request.app.getNewUoW(false);
    const users = await uow.usersRepository.getAllUsers();

    await reply({message: '', data: {users:users}});
}

module.exports = UsersHandler;