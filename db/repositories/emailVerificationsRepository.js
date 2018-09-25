const moment = require('moment');

class EmailVerificationsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async addEntry(userEmailId) {
        const payload = {
           createdAt: moment.utc().format(),
           userEmailId
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
}

module.exports = EmailVerificationsRepository;