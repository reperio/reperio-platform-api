class UsersRepository {
    constructor(uow) {
        this.dataModel = dataModel;
    }

    async getAllUsers() {
        const userInstances = await this.dataModel._db.users.findAll();
        return userInstances.map(x => x.get());
    }

    async getUserById(userId) {
        const userInstance = await this.dataModel._db.users.findById(userId);
        return userInstance != null ? userInstance.get() : null;
    }

    async getUserByUsername(username) {
        const userInstance = await this.dataModel._db.users.findOne({
            where: {
                username: username
            }
        });
        return userInstance != null ? userInstance.get() : null;
    }
}

module.exports = UsersRepository;