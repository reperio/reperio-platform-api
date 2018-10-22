module.exports = [
    {
        method: 'GET',
        path: '/billingAccounts/all',
        handler: async (request, h) => {
            const activityLogger = request.server.app.activityLogger;
            const requestMeta = request.app.getRequestDetails();
            await activityLogger.info('Fetch all billing accounts', requestMeta);
            
            const uow = await request.app.getNewUoW();
            const logger = request.server.app.logger;
            try {
                logger.debug('Fetching all accounts');
                const accounts = await uow.accountsRepository.getAllBillingAccounts();
                
                requestMeta.responseCode = 200;
                await activityLogger.info('Fetched all billing accounts', requestMeta);
                return {status: 0, message: 'success', data: accounts};
            } catch (err) {
                logger.error(err);
                requestMeta.otherDetails.error = err;
                requestMeta.responseCode = 500;
                await activityLogger.error('Fetch all billing accounts failed', requestMeta);
                return {status: 1, message: 'error', data: null};
            }
        }
    }
];

