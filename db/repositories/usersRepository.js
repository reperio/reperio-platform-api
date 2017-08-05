class UsersRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async getAllUsers() {
        const userInstances = await this.uow._db.users.findAll({
            transaction: this.uow._transaction
        });
        return userInstances.map(x => x.get());
    }

    async getUserById(userId) {
        const userInstance = await this.uow._db.users.findById(userId, {
            transaction: this.uow._transaction
        });
        return userInstance != null ? userInstance.get() : null;
    }

    async getUserByUsername(username) {
        const userInstance = await this.uow._db.users.findOne({
            where: {
                username: username
            },
            transaction: this.uow._transaction
        });
        return userInstance != null ? userInstance.get() : null;
    }
}

module.exports = UsersRepository;