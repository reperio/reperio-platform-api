class AccountsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async getAllBillingAccounts() {
        try {
            const q = this.uow._models.BillingAccount
                .query(this.uow._transaction)
                .orderBy('name', 'ASC');

            const hosts = await q;

            return hosts;
        } catch (err) {
            this.uow._logger.error('Failed to fetch billing accounts from database');
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = AccountsRepository;
