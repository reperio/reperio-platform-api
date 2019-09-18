const v4 = require('uuid/v4');

class ApplicationsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createApplication(name, apiUrl, clientUrl, secretKey) {
        const payload = {
            name,
            apiUrl,
            clientUrl,
            secretKey,
            deleted: false,
            id: v4()
        };

        try {
            return await this.uow._models.Application
                .query(this.uow._transaction)
                .insertAndFetch(payload);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create app`);
            throw err;
        }
    }

    async deleteApplication(id) {

        try {
            return await this.uow._models.Application
                .query(this.uow._transaction)
                .patch({deleted: true})
                .where('id', id);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to delete app`);
            throw err;
        }
    }

    async getApplicationById(id) {
        try {
            return await this.uow._models.Application
                .query(this.uow._transaction)
                .where('id', id)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch application using id: ${id}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllApplications() {
        try {
            return await this.uow._models.Application
                .query(this.uow._transaction);
        } catch (err) {
            this.uow._logger.error(`Failed to fetch applications`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getOrganizationsForApplicationByIds(applicationId, organizationIds) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .join('applicationOrganizations', 'organizations.id', '=', 'applicationOrganizations.organizationId')
                .where('applicationOrganizations.active', '=', true)
                .andWhere('applicationOrganizations.applicationId', '=', applicationId)
                .whereIn('organizations.id', organizationIds);
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organizations for application`);
            this.uow._logger.error(err.message);
            throw err;
        }
    }
}

module.exports = ApplicationsRepository;