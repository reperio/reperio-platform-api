class QueryHelper {
    constructor(uow, logger) {
        this.logger = logger;
        this.uow = uow;
    }

    addFilters(chain, filter) {
        filter.forEach((filterItem) => {
            const { id, value } = filterItem;
            chain = chain.where(id, 'ILIKE', value + '%')
        });
        return chain;
    }

    addSorts(chain, sort) {
        sort.forEach((sortItem) => {
            const { id, desc } = sortItem;
            chain = chain.orderBy(id, desc? 'DESC' : 'ASC')
        });
        return chain;
    }
    
    getQueryResult(chain, queryParameters) {
        const { page, pageSize, filter, sort } = queryParameters;
        this.logger.info('Starting query chain');

        chain = this.uow._Model.query(this.uow._transaction).from(chain.clone().as("t1"));
        chain = this.addFilters(chain, filter);
        chain = this.addSorts(chain, sort);
        return chain.page(page, pageSize);
    }
}

module.exports = QueryHelper;