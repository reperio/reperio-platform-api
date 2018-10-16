const moment = require('moment');

class ForgotPasswordsRepository {
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
            const q = this.uow._models.ForgotPassword
                .query(this.uow._transaction)
                .insertAndFetch(payload);

            const entry = await q;

            return entry;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create forgot password`);
            throw err;
        }
    }

    async getEntry(forgotPasswordId) {
        try {
            const q = this.uow._models.ForgotPassword
                .query(this.uow._transaction)
                .where('id', forgotPasswordId);

            const entry = await q;

            return entry[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch forgot password using id: ${forgotPasswordId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async trigger(forgotPasswordId, now) {
        try {
            const q = this.uow._models.ForgotPassword
                .query(this.uow._transaction)
                .patch({triggeredAt: now})
                .where('id', forgotPasswordId);

            const entry = await q;

            return entry;
        } catch (err) {
            this.uow._logger.error(`Failed to trigger forgot password: ${forgotPasswordId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = ForgotPasswordsRepository;