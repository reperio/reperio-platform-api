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

    async createOrganizationWithAddress(organization, personal = true) {
        const organizationModel = {
            name: organization.name,
            personal: personal,
            deleted: false
        };
        try {
            const newOrganization = await this.uow._models.Organization
                .query(this.uow._transaction)
                .insert(organizationModel)
                .returning("*");

            const organizationAddressModel = {
                organizationId: newOrganization.id,
                streetAddress: organization.streetAddress,
                suiteNumber: organization.suiteNumber,
                city: organization.city,
                state: organization.state,
                zip: organization.zip,
                deleted: false
            };

            await this.uow._models.OrganizationAddress
                .query(this.uow._transaction)
                .insert(organizationAddressModel)
                .returning("*");

            return newOrganization
        } catch (err) {
            this.uow._logger.error(`Failed to create organization: ${organization.name}`);
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
                .join('roles', 'organizations.id', 'roles.organizationId')
                .join('userRoles', 'roles.id', 'userRoles.roleId')
                .join('users', 'userRoles.userId', 'users.id')
                .where('users.id', '=', userId)
                .orderBy('name');
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organizations by userId: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getOrganizationByIdAndUserId(organizationId, userId) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .join('roles', 'organizations.id', 'roles.organizationId')
                .join('userRoles', 'roles.id', 'userRoles.roleId')
                .join('users', 'userRoles.userId', 'users.id')
                .where('organizations.id', '=', organizationId)
                .andWhere('users.id', '=', userId)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organization: ${organizationId} by userId: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getOrganizationsByUserWithBilling(userId) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .join('roles', 'organizations.id', 'roles.organizationId')
                .join('userRoles', 'roles.id', 'userRoles.roleId')
                .join('users', 'userRoles.userId', 'users.id')
                .where('users.id', '=', userId)
                .andWhere('roles.name', '=', 'Organization Admin')
                .orderBy('name');
        } catch (err) {
            this.uow._logger.error(`Failed to fetch organizations with billing by userId: ${userId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async getOrganizationByOrganizationInformation(organization) {
        try {
            return await this.uow._models.Organization
                .query(this.uow._transaction)
                .join('organizationAddresses as organizationAddresses', 'organizationAddresses.organizationId', 'organizations.id')
                .where('organizations.name', '=', organization.name)
                .andWhere('organizationAddresses.streetAddress', '=', organization.streetAddress)
                .andWhere('organizationAddresses.suiteNumber', '=', organization.suiteNumber)
                .andWhere('organizationAddresses.city', '=', organization.city)
                .andWhere('organizationAddresses.state', '=', organization.state)
                .andWhere('organizationAddresses.zip', '=', organization.zip)
                .first();

        } catch (err) {
            this.uow._logger.error(`Failed to fetch organizations by organization name: ${organization.name} and address ${organization.streetAddress}, ${organization.suiteNumber}, ${organization.city}, ${organization.state}, ${organization.zip}`);
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

    async getApplicationOrganization(organizationId, applicationId) {
        try {
            return await this.uow._models.ApplicationOrganization
                .query(this.uow._transaction)
                .where('applicationId', applicationId)
                .andWhere('organizationId', organizationId)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch applicationOrganization using applicationId: ${applicationId} - organizationId: ${organizationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async createApplicationOrganization(organizationId, applicationId) {
        const organizationApplicationModel = {
            applicationId,
            organizationId,
            active: true
        };

        try {
            return await this.uow._models.ApplicationOrganization
                .query(this.uow._transaction)
                .insert(organizationApplicationModel)
                .returning("*");
        } catch (err) {
            this.uow._logger.error(`Failed to create applicationOrganization - applicationId: ${applicationId} - organizationId: ${organizationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async enableApplicationOrganization(organizationId, applicationId) {
        try {
            return await this.uow._models.ApplicationOrganization
                .query(this.uow._transaction)
                .patch({active: true})
                .where('applicationId', applicationId)
                .where('organizationId', organizationId)
                .returning("*")
                .first();

        } catch (err) {
            this.uow._logger.error(`Failed to enable applicationOrganization - applicationId: ${applicationId} - organizationId: ${organizationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = OrganizationsRepository;
