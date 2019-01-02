const uuid4 = require("uuid/v4");

class OrganizationsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createOrganization(name, personal) {
        const organizationModel = {
            name,
            personal,
            deleted: false
        };

        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .insertAndFetch(organizationModel);
        } catch (err) {
            this.uow._logger.error(`Failed to create organization: ${name}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async deleteOrganization(id) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .patchAndFetchById(id, {deleted: true});
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to delete organization`);
            throw err;
        }
    }

    async getOrganizationById(organizationId) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .where('id', organizationId)
                .eager('userOrganizations.user')
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organization using id: ${organizationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getOrganizationsByUser(userId) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .join('userOrganizations as userOrganization', 'userOrganization.organizationId', 'organizations.id')
                .where('userOrganization.userId', '=', userId)
                .orderBy('name');
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organizations by userId: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getOrganizationByOrganizationInformation(organization) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .join('organizationAddresses as organizationAddresses', 'organizationAddresses.organizationId', 'organizations.id')
                .where('organizations.name', organization.name)
                .andWhere('organizationAddresses.streetAddress', organization.streetAddress)
                .andWhere('organizationAddresses.suiteNumber', organization.suiteNumber)
                .andWhere('organizationAddresses.city', organization.city)
                .andWhere('organizationAddresses.state', organization.state)
                .andWhere('organizationAddresses.zip', organization.zip);
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organizations by userId: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllOrganizations() {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .orderBy('name');
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organizations`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async editOrganization(id, name) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .patchAndFetchById(id, {name});
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to edit organization`);
            throw err;
        }
    }
}

module.exports = OrganizationsRepository;
