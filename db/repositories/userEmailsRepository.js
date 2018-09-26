class UserEmailsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createUserEmail(userId, email) {
        const payload = {
           userId,
           email,
           emailVerified: false,
           deleted: false
        }
        try {
            return await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .insertAndFetch(payload);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create user email`);
            throw err;
        }
    }

    async getUserEmail(id) {
        try {
            const q = this.uow._models.UserEmail
                .query(this.uow._transaction)
                .where('id', id);

            const userEmail = await q;

            return userEmail[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user email using id: ${id}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getUserEmail(userId, email) {
        try {
            const q = this.uow._models.UserEmail
                .query(this.uow._transaction)
                .where('userId', userId)
                .andWhere('email', email);

            const userEmail = await q;

            return userEmail[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user email using userId and email: ${id}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = UserEmailsRepository;