const moment = require('moment');

class EmailVerificationsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async addEntry(userEmailId, userId) {
        const payload = {
           createdAt: moment.utc().format(),
           userEmailId,
           userId
        }
        try {
            const q = this.uow._models.EmailVerification
                .query(this.uow._transaction)
                .insertAndFetch(payload);

            const entry = await q;

            return entry;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create email verification`);
            throw err;
        }
    }

    async getEntry(id) {
        try {
            const q = this.uow._models.EmailVerification
                .query(this.uow._transaction)
                .where('id', id);

            const entry = await q;

            return entry[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch email verification using id: ${id}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async trigger(id, now) {
        try {
            const q = this.uow._models.EmailVerification
                .query(this.uow._transaction)
                .patch({triggeredAt: now})
                .where('id', id);

            const entry = await q;

            return entry;
        } catch (err) {
            this.uow._logger.error(`Failed to trigger email verification: ${id}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = EmailVerificationsRepository;