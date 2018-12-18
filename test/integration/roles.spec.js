const chai = require("chai");
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const sharedDatabase = require('./sharedDatabase');

// taken from seed files
const seededRoleId = 'e37c87b4-b92e-11e8-96f8-529269fb1459';
const seededOrganizationId = '966f4157-934c-45e7-9f44-b1e5fd8b79a7';

describe('Roles Repository', () => {
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

    describe('getAllRoles()', () => {
        it('returns array with 2 seeded roles', async () => {
            const roles = await uow.rolesRepository.getAllRoles();
            
            expect(Array.isArray(roles)).to.be.equal(true);
            expect(roles.length).to.be.equal(2);
        });

        it('should log an error on an exception for getAllRoles', async (done) => {
            const e = new Error('test error');
            sandbox.stub(uow._models.Role, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.rolesRepository.getAllRoles();
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith('Failed to fetch roles');
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });

    describe('getAllActiveRoles()', () => {
        it('should return 1 active role', async () => {
            const roles = await uow.rolesRepository.getAllActiveRoles();

            expect(Array.isArray(roles)).to.be.equal(true);
            expect(roles.length).to.be.equal(1);
        });

        it('should log an error on an exception for getAllActiveRoles', async (done) => {
            const e = new Error('test error');
            sandbox.stub(uow._models.Role, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.rolesRepository.getAllActiveRoles();
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith('Failed to fetch roles');
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });

    describe('getRoleById()', () => {
        it('should return "Core Super Admin" role', async () => {
            const role = await uow.rolesRepository.getRoleById(seededRoleId);

            expect(typeof role).to.be.equal('object');
            expect(role.id).to.be.equal(seededRoleId);
            expect(role.name).to.be.equal('Core Super Admin');
        });

        it('should log an error on an exception for getRoleById', async (done) => {
            const e = new Error('test error');
            sandbox.stub(uow._models.Role, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.rolesRepository.getRoleById(seededRoleId);
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith(`Failed to fetch role using id: ${seededRoleId}`);
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });

    describe('createRole()', () => {
        it('creates new role', async () => {
            const newRoleName = 'Test Role';
            const newRole = await uow.rolesRepository.createRole(newRoleName, seededOrganizationId, null);

            expect(typeof newRole).to.be.equal('object');
            expect(newRole.id).not.to.be.equal(undefined);
            expect(newRole.name).to.be.equal(newRoleName);
            expect(newRole.organizationId).to.be.equal(seededOrganizationId);
            expect(newRole.applicationId).to.be.equal(null);
        });

        it('should log an error on an exception for createRole', async (done) => {
            const e = new Error('test error');
            sandbox.stub(uow._models.Role, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            const newRoleName = 'Test Role';

            try{
                await uow.rolesRepository.createRole(newRoleName, seededOrganizationId, null);
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith('Failed to create role');
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });

    describe('editRole()', () => {
        it('only edits role name', async () => {
            const orginalRole = await uow.rolesRepository.createRole('wrong name', seededOrganizationId, null);
            expect(orginalRole.id).not.to.be.equal(undefined);

            const editedRoleName = 'right name';
            const editedRole = await uow.rolesRepository.editRole(orginalRole.id, editedRoleName);

            expect(editedRole.name).to.be.equal(editedRoleName);
            expect(editedRole.id).to.be.equal(orginalRole.id);
            expect(editedRole.organizationId).to.be.equal(orginalRole.organizationId);
            expect(editedRole.applicationId).to.be.equal(orginalRole.applicationId);
            expect(editedRole.deleted).to.be.equal(orginalRole.deleted);
        });

        it('should log an error on an exception for editRole', async (done) => {
            const editedRoleName = 'right name';
            const orginalRole = await uow.rolesRepository.createRole('wrong name', seededOrganizationId, null);
            expect(orginalRole.id).not.to.be.equal(undefined);

            const e = new Error('test error');
            sandbox.stub(uow._models.Role, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.rolesRepository.editRole(orginalRole.id, editedRoleName);
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith('Failed to edit role');
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });

    describe('updateRolePermissions()', () => {
        it('adds permissions to role', async () => {
            const newRoleName = 'Permissions Test 1';
            const newRole = await uow.rolesRepository.createRole(newRoleName, seededOrganizationId, null);

            const newRoleWithNoPermissions = await uow.rolesRepository.getRoleById(newRole.id);
            expect(Array.isArray(newRoleWithNoPermissions.rolePermissions)).to.be.equal(true);
            expect(newRoleWithNoPermissions.rolePermissions.length).to.be.equal(0);

            await uow.rolesRepository.updateRolePermissions(newRole.id, ['ViewUsers']);
            const newRoleWithPermissions = await uow.rolesRepository.getRoleById(newRole.id);
            expect(Array.isArray(newRoleWithPermissions.rolePermissions)).to.be.equal(true);
            expect(newRoleWithPermissions.rolePermissions.length).to.be.equal(1);
        });

        it('overwrites previous permissions', async () => {
            const newRoleName = 'Permissions Test 2';
            const newRole = await uow.rolesRepository.createRole(newRoleName, seededOrganizationId, null);
            await uow.rolesRepository.updateRolePermissions(newRole.id, ['ViewUsers', 'CreateUsers', 'DeleteUsers']);

            const newRoleWithPermissions = await uow.rolesRepository.getRoleById(newRole.id);
            expect(Array.isArray(newRoleWithPermissions.rolePermissions)).to.be.equal(true);
            expect(newRoleWithPermissions.rolePermissions.length).to.be.equal(3);

            await uow.rolesRepository.updateRolePermissions(newRole.id, ['ViewRoles']);
            const newRoleWithNewPermissions = await uow.rolesRepository.getRoleById(newRole.id);
            expect(Array.isArray(newRoleWithNewPermissions.rolePermissions)).to.be.equal(true);
            expect(newRoleWithNewPermissions.rolePermissions.length).to.be.equal(1);
            expect(newRoleWithNewPermissions.rolePermissions[0].permission.name).to.be.equal('ViewRoles');
        });

        it('should log an error on an exception for updateRolePermissions', async (done) => {
            const newRoleName = 'Permissions Test 3';
            const newRole = await uow.rolesRepository.createRole(newRoleName, seededOrganizationId, null);
            await uow.rolesRepository.updateRolePermissions(newRole.id, ['ViewUsers', 'CreateUsers', 'DeleteUsers']);

            const newRoleWithPermissions = await uow.rolesRepository.getRoleById(newRole.id);
            expect(Array.isArray(newRoleWithPermissions.rolePermissions)).to.be.equal(true);
            expect(newRoleWithPermissions.rolePermissions.length).to.be.equal(3);

            const e = new Error('test error');
            sandbox.stub(uow._models.RolePermission, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.rolesRepository.updateRolePermissions(newRole.id, ['ViewRoles']);
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith('Failed to update role permissions');
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });

    describe('deleteRole()', () => {
        it('marks role as deleted', async () => {
            const newRole = await uow.rolesRepository.createRole('Deleted Role', seededOrganizationId, null);
            expect(newRole.deleted).to.be.equal(false);

            const deletedRole = await uow.rolesRepository.deleteRole(newRole.id);
            expect(deletedRole.deleted).to.be.equal(true);
        });

        it('should log an error on an exception for deleteRole', async (done) => {
            const newRole = await uow.rolesRepository.createRole('Deleted Role', seededOrganizationId, null);
            expect(newRole.deleted).to.be.equal(false);
            
            const e = new Error('test error');
            sandbox.stub(uow._models.Role, 'query').throws(e);
            let stub = sandbox.stub(uow._logger, 'error').returns(true);

            try{
                await uow.rolesRepository.deleteRole(newRole.id);
                done(new Error('Exception not thrown'))
            } catch(e) {
                expect(stub).to.have.been.calledWith('Failed to delete role');
                expect(stub).to.have.been.calledWith(e);
                done();
            }
        });
    });
});