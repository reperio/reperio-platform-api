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

    async editUserEmails(userId, userEmails, primaryEmailId) {
        try {
            const submittedEmails = userEmails.map(x => x.email);

            //Update deleted userEmail records that share the same email
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

            //Determine userEmails that have been deleted, filters out the primary email
            const deleted = existingUserEmails
                .filter(x => !userEmails
                    .map(y=> y.id).includes(x.id) && x.id != primaryEmailId)
                .filter(b => !existingDeletedUserEmails
                    .map(c=> c.email).includes(b.email))
                .map(x=> x.id);

            await this.uow._models.UserEmail
                .query(this.uow._transaction)
                .patch({deleted: true})
                .whereIn("id", deleted)
                .returning("*");

            return existingDeletedUserEmails.concat(inserted);
        } catch (err) {
            this.uow._logger.error(`Failed to edit a users emails with userId: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = UserEmailsRepository;