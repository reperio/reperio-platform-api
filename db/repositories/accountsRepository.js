class AccountsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async getAllAccounts() {
        try {
            const q = this.uow._models.Account
                .query(this.uow._transaction)
                .orderBy('name', 'ASC');

            const hosts = await q;

            return hosts;
        } catch (err) {
            this.uow._logger.error('Failed to fetch hosts from database');
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = AccountsRepository;
