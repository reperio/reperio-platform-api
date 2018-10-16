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

    async getUserEmail(userEmailId) {
        try {
            const q = this.uow._models.UserEmail
                .query(this.uow._transaction)
                .where('id', userEmailId);

            const userEmail = await q;

            return userEmail[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user email using id: ${userEmailId}`);
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
            this.uow._logger.error(`Failed to fetch user email using userId and email: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async editUserEmails(userId, userEmails) {
        try {
            const existingUserEmails = await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .where({userId});
        
            const existingEmails = existingUserEmails.map(x=> x.email);
            const newUserEmailIds = userEmails.map(y=> y.id);
            const newUserEmails = userEmails.map(y=> y.email);

            const deletedIds = existingUserEmails.filter(x => !newUserEmailIds.includes(x.id)).map(x=> x.id);

            const inserted = userEmails.filter(x => !x.id && !existingEmails.includes(x.email)).map(x=> {
                return {
                    email: x.email,
                    userId,
                    emailVerified: false,
                    deleted: false
                }
            });

            const updatedIds = existingUserEmails.filter(x=> newUserEmails.includes(x.email) && x.deleted).map(x=> x.id);

            await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .patch({deleted: true})
                .whereIn("id", deletedIds);

            await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .patch({deleted: false, emailVerified: false})
                .whereIn("id", updatedIds);

            await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .insert(inserted)
                .returning("*");
        } catch (err) {
            this.uow._logger.error(`Failed to edit a users emails with userId: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = UserEmailsRepository;