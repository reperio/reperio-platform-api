const uuid4 = require("uuid/v4");

class UsersRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createUser(userDetail) {
        try {
            userDetail.id = uuid4();
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .insertAndFetch(userDetail);

            const user = await q;

            return user;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create user: ${userDetail.email} for org ${userDetail.organizationId}`);
            throw err;
        }
    }

    async getUserById(userId) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .where('id', userId);

            const user = await q;

            return user[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user using id: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getUserByEmail(email) {
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .where('email', email);

            const user = await q;

            return user[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user using email: ${email}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = UsersRepository;
