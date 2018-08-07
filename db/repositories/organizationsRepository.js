const uuid4 = require("uuid/v4");

class OrganizationsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createOrganization(name, personal) {
        const organizationModel = {
            name,
            id: uuid4(),
            personal,
            deleted: false
        };
        try {
            const q = this.uow._models.Organization
                .query(this.uow._transaction)
                .insertAndFetch(organizationModel);

            const organization = await q;

            return organization;
        } catch (err) {
            this.uow._logger.error(`Failed to create organization: ${name}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async deleteOrganization(id) {
        try {
            const q = this.uow._models.Organization
                .query(this.uow._transaction)
                .patch({deleted: true})
                .where('id', id);

            const result = await q;

            return result;
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to delete organization`);
            throw err;
        }
    }

    async getOrganizationById(id) {
        try {
            const q = this.uow._models.Organization
                .query(this.uow._transaction)
                .where('id', id);

            const organization = await q;

            return organization[0];
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organization using id: ${id}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getAllOrganizations() {
        try {
            const q = this.uow._models.Organization
                .query(this.uow._transaction);

            const organizations = await q;

            return organizations;
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organizations`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = OrganizationsRepository;
