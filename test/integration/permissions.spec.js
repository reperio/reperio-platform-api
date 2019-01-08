const chai = require("chai");
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

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
    let sandbox;

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

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    })

    describe('getAllPermissions()', () => {
        it('returns an array with seeded permissions', async () => {
            const permissions = await uow.permissionsRepository.getAllPermissions();
    
            expect(Array.isArray(permissions)).to.be.equal(true);
            expect(permissions.length).to.be.equal(20);
            expect(permissions[0].name).to.be.equal(seededPermissionName);
        });

        it('should log an error on an exception for getAllPermissions', async (done) => {
            const e = new Error('test error');
            sandbox.stub(uow._models.Permission, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.permissionsRepository.getAllPermissions();
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith('Failed to fetch permissions');
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });
    
    describe('getPermissionByName()', () => {
        it('returns seeded permission', async () => {
            const permission = await uow.permissionsRepository.getPermissionByName(seededPermissionName);
            
            expect(typeof permission).to.be.equal('object');
            expect(permission.name).to.be.equal(seededPermissionName);
        });

        it('should log an error on an exception for getPermissionByName', async (done) => {
            const e = new Error('test error');
            sandbox.stub(uow._models.Permission, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.permissionsRepository.getPermissionByName(seededPermissionName);
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith(`Failed to fetch permission: ${seededPermissionName}`);
                expect(stub).to.have.been.calledWith(e);
                done();
            }
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

        it('should log an error on an exception for editPermission', async (done) => {
            const e = new Error('test error');
            sandbox.stub(uow._models.Permission, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.permissionsRepository.editPermission('', '', '', null, false);
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith(`Failed to edit permission`);
                expect(stub).to.have.been.calledWith(e);
                done();
            }
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

        it('should log an error on an exception for managePermissionsUsedByRoles', async (done) => {
            const e = new Error('test error');
            sandbox.stub(uow._models.RolePermission, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.permissionsRepository.managePermissionsUsedByRoles([{roleId: seededRoleId, permissionName: seededPermissionName}], seededPermissionName);
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith(`Failed to update role permissions`);
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });
});