module.exports = [
    {
        method: 'GET',
        path: '/billingAccounts/all',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug('Fetching all accounts');

            const accounts = await uow.accountsRepository.getAllBillingAccounts();
            
            return {status: 0, message: 'success', data: accounts};
        },
        config: {
        }
    }
];

