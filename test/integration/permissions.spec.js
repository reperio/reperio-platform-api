const chai = require("chai");
const expect = chai.expect;

const sharedLogger = require('./sharedLogger');
const UoW = require('../../db');

const knexConfig = require('../../db/knexfile');
const Knex = require('knex');
const knex = Knex(knexConfig);

const sharedDatabase = require('./sharedDatabase');

// taken from seed files
const seededPermissionName = 'ViewUsers';
const seededRoleId = 'e37c87b4-b92e-11e8-96f8-529269fb1459';

describe('Permissions Repository', () => {
    let uow = null;
    let databaseName = null;

    beforeAll(async () => {
        // create test database and uow
        const {testUoW, testDatabaseName} = await sharedDatabase.createTestDatabase();
        uow = testUoW;
        databaseName = testDatabaseName;
    });

    afterAll(async () => {
        // close uow database connection
        await uow._knex.destroy();

        // drop test database
        await sharedDatabase.dropTestDatabase(databaseName);
    });

    describe('getAllPermissions()', () => {
        it('returns an array with seeded permissions', async () => {
            const permissions = await uow.permissionsRepository.getAllPermissions();
    
            expect(Array.isArray(permissions)).to.be.equal(true);
            expect(permissions.length).to.be.equal(20);
            expect(permissions[0].name).to.be.equal(seededPermissionName);
        });
    });
    
    describe('getPermissionByName()', () => {
        it('returns seeded permission', async () => {
            const permission = await uow.permissionsRepository.getPermissionByName(seededPermissionName);
            
            expect(typeof permission).to.be.equal('object');
            expect(permission.name).to.be.equal(seededPermissionName);
        });
    });

    describe('editPermission()', () => {
        it('only updates permission display name', async () => {
            const permission = await uow.permissionsRepository.getPermissionByName(seededPermissionName);
            let editedPermission = await uow.permissionsRepository.editPermission(permission.name, permission.displayName + 1, permission.description, null, false);
            const fixedPermission = await uow.permissionsRepository.editPermission(permission.name, permission.displayName, permission.description, null, false);
            expect(editedPermission.displayName).to.be.equal(permission.displayName + 1);
            expect(fixedPermission.displayName).to.be.equal(permission.displayName);
        });
    });

    describe('managePermissionsUsedByRoles()', () => {
        it('should create a role, update it with a permission, and then remove the permission', async () => {
            const permission = await uow.permissionsRepository.getPermissionByName(seededPermissionName);
            
            expect(typeof permission).to.be.equal('object');
            expect(permission.name).to.be.equal(seededPermissionName);
            expect(Array.isArray(permission.rolePermissions)).to.be.equal(true);
            expect(permission.rolePermissions.length).to.be.equal(1);

            await uow.permissionsRepository.managePermissionsUsedByRoles([], seededPermissionName);
            
            const updatedPermission = await uow.permissionsRepository.getPermissionByName(seededPermissionName);
            expect(updatedPermission.name).to.be.equal(seededPermissionName);
            expect(Array.isArray(updatedPermission.rolePermissions)).to.be.equal(true);
            expect(updatedPermission.rolePermissions.length).to.be.equal(0);

            await uow.permissionsRepository.managePermissionsUsedByRoles([{roleId: seededRoleId, permissionName: seededPermissionName}], seededPermissionName);

            const revertedPermission = await uow.permissionsRepository.getPermissionByName(seededPermissionName);
            
            expect(typeof revertedPermission).to.be.equal('object');
            expect(revertedPermission.name).to.be.equal(seededPermissionName);
            expect(Array.isArray(revertedPermission.rolePermissions)).to.be.equal(true);
            expect(revertedPermission.rolePermissions.length).to.be.equal(1);
        });
    });
});