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
            const existingUserEmail = await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .where('email', email)
                .first();

            if (existingUserEmail) {
                return await this.uow._models.UserEmail
                    .query(this.uow._transaction)
                    .patch({deleted: false, userId, emailVerified: false})
                    .where('id', existingUserEmail.id)
                    .returning("*")
                    .first();
            }

            return await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .insertAndFetch(payload);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create user email`);
            throw err;
        }
    }

    async getUserEmailById(userEmailId) {
        try {
            return await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .where('id', userEmailId)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user email using id: ${userEmailId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getUserEmail(userId, email) {
        try {
            return await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .where('userId', userId)
                .andWhere('email', email)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user email using userId and email: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async deleteUserEmails(userEmailIds, userId) {
        try {
            await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .patch({deleted: true})
                .whereIn('id', userEmailIds);

        } catch (err) {
            this.uow._logger.error(`Failed to delete userEmails for: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async addUserEmails(userId, userEmails) {
        try {
            const submittedEmails = userEmails.map(x => x.email);

            const existingDeletedUserEmails = await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .patch({userId, deleted: false})
                .whereIn('email', submittedEmails)
                .andWhere("deleted", true)
                .returning("*");

            const existingUserEmails = await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .mergeEager('user')
                .where({userId});

            //Determine what userEmails are to be inserted by filtering out userEmails with ids and emails that have been reused
            const toBeInserted = userEmails
                .filter(a => !a.id && !existingUserEmails
                    .map(x=> x.email).includes(a.email))
                .filter(b => !existingDeletedUserEmails
                    .map(c=> c.email).includes(b.email))
                        .map(d=> {
                            return {
                                email: d.email,
                                userId,
                                emailVerified: false,
                                deleted: false
                            }
                        });

            const inserted = await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .insertAndFetch(toBeInserted);

            return existingDeletedUserEmails.concat(inserted);
        } catch (err) {
            this.uow._logger.error(`Failed to create userEmails for: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllUserEmailsByUserId(userId) {
        try {
            const q = this.uow._models.UserEmail
                .query(this.uow._transaction)
                .where('userId', userId);
            return await q;
        } catch (err) {
            this.uow._logger.error(`Failed to fetch user emails for user: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = UserEmailsRepository;