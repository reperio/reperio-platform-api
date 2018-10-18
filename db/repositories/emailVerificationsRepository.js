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

    async getEntry(emailVerificationId) {
        try {
            const q = this.uow._models.EmailVerification
                .query(this.uow._transaction)
                .where('id', emailVerificationId);

            const entry = await q;

            return entry[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch email verification using id: ${emailVerificationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async trigger(emailVerificationId, now) {
        try {
            const q = this.uow._models.EmailVerification
                .query(this.uow._transaction)
                .patch({triggeredAt: now})
                .where('id', emailVerificationId);

            const entry = await q;

            return entry;
        } catch (err) {
            this.uow._logger.error(`Failed to trigger email verification: ${emailVerificationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = EmailVerificationsRepository;