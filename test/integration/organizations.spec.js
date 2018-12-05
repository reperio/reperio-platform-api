const chai = require("chai");
const expect = chai.expect;

const sharedLogger = require('./sharedLogger');
const UoW = require('../../db');

const knexConfig = require('../../db/knexfile');
const Knex = require('knex');
const knex = Knex(knexConfig);

const sharedDatabase = require('./sharedDatabase');

// taken from seed files
const seededOrgId = '966f4157-934c-45e7-9f44-b1e5fd8b79a7';
const seededUserId = 'd08a1f76-7c4a-4dd9-a377-83ffffa752f4';

describe('Organizations Repository', () => {
    const uow = new UoW(sharedLogger);

    beforeAll(async () => {
        await sharedDatabase.setUpTest(knex, knexConfig);
    });

    afterAll(async () => {
        await sharedDatabase.tearDownTest(knex, knexConfig);
    });

    describe('getAllOrganizations()', () => {
        it('returns an array with seeded organziation', async () => {
            const organizations = await uow.organizationsRepository.getAllOrganizations();
    
            expect(Array.isArray(organizations)).to.be.equal(true);
            expect(organizations.length).to.be.equal(1);
            expect(organizations[0].id).to.be.equal(seededOrgId);
        });
    });
    
    describe('getOrganizationById()', () => {
        it('returns seeded organization', async () => {
            const organization = await uow.organizationsRepository.getOrganizationById(seededOrgId);
            
            expect(typeof organization).to.be.equal('object');
            expect(organization.id).to.be.equal(seededOrgId);
        });
    });

    describe('getOrganizationsByUser()', () => {
        it('returns array with seeded organization', async () => {
            const organizations = await uow.organizationsRepository.getOrganizationsByUser(seededUserId);

            expect(Array.isArray(organizations)).to.be.equal(true);
            expect(organizations.length).to.be.equal(1);
            expect(organizations[0].id).to.be.equal(seededOrgId);
        });
    });

    describe('createOrganization()', () => {
        it('creates new organization', async () => {
            const orgName = 'New Organization';
            const insertedOrg = await uow.organizationsRepository.createOrganization(orgName, false);
            
            expect(insertedOrg).not.to.be.equal(undefined);
            expect(insertedOrg.id).not.to.be.equal(undefined);
            expect(insertedOrg.name).to.be.equal(orgName);
            expect(insertedOrg.personal).to.be.equal(false);
            expect(insertedOrg.deleted).to.be.equal(false);
        });

        it('creates new personal organization', async () => {
            const orgName = 'New Personal Organization';
            const insertedOrg = await uow.organizationsRepository.createOrganization(orgName, true);
            
            expect(insertedOrg).not.to.be.equal(undefined);
            expect(insertedOrg.id).not.to.be.equal(undefined);
            expect(insertedOrg.name).to.be.equal(orgName);
            expect(insertedOrg.deleted).to.be.equal(false);
            expect(insertedOrg.personal).to.be.equal(true);
        });
    });

    describe('editOrganization()', () => {
        it('only updates organization name', async () => {
            const originalOrganization = await uow.organizationsRepository.createOrganization('wrong name', false);
            const newName = 'right name';
            const editedOrganization = await uow.organizationsRepository.editOrganization(originalOrganization.id, newName);

            expect(editedOrganization.name).to.be.equal(newName);
            expect(editedOrganization.deleted).to.be.equal(originalOrganization.deleted);
            expect(editedOrganization.personal).to.be.equal(originalOrganization.personal);
        });
    });

    describe('deleteOrganization()', () => {
        it('marks organization as deleted', async () => {
            const originalOrganization = await uow.organizationsRepository.createOrganization('deleted org', false);
            expect(originalOrganization.deleted).to.be.equal(false);

            const deletedOrganization = await uow.organizationsRepository.deleteOrganization(originalOrganization.id);
            expect(deletedOrganization.deleted).to.be.equal(true);
        });
    });
});