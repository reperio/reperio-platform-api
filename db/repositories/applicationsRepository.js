const v4 = require('uuid/v4');

class ApplicationsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createApplication(name, description, baseUrl) {
        const payload = {
            name,
            description,
            baseUrl,
            id: v4()
        };

        try {
            const q = this.uow._models.Application
                .query(this.uow._transaction)
                .insertAndFetch(payload);

            const app = await q;

            return app;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create app`);
            throw err;
        }
    }

    async getApplicationById(id) {
        try {
            const q = this.uow._models.Application
                .query(this.uow._transaction)
                .where('id', id);

            const app = await q;

            return app[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch application using id: ${id}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllApplications() {
        try {
            const q = this.uow._models.Application
                .query(this.uow._transaction);

            const apps = await q;

            return apps;
        } catch (err) {
            this.uow._logger.error(`Failed to fetch applications`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = ApplicationsRepository;
