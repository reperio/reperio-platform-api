module.exports = [
    {
        method: 'GET',
        path: '/accounts/all',
        handler: async (request, h) => {
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;

            logger.debug('Fetching all accounts');

            const accounts = await uow.accountsRepository.getAllAccounts();
            
            return {status: 0, message: 'success', data: accounts};
        },
        config: {
            auth: false
        }
    }
];

