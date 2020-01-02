const uuid = require('uuid/v4');

exports.up = async function(knex, Promise) {
    // link emailVerifications to users table instead of userEmails then drop userEmailId column
    await knex.schema
        .alterTable('emailVerifications', t => {
            t.dropColumn('userEmailId');
        });

    await knex.schema
        .alterTable('forgotPasswords', t => {
            t.dropColumn('userEmailId');
        });

    // add emailVerified to users table
    await knex.schema
        .alterTable('users', t => {
            t.boolean('emailVerified');
        });

    // get existing verifications from userEmails table
    const verifications = await knex('userEmails')
        .select('userId', 'emailVerified');


    // iterate over verifications & add them to users table
    await knex.transaction(trx => {
        const queries = [];
        verifications.forEach(v => {
            const query = knex('users')
                .update({emailVerified: v.emailVerified})
                .where('id',v.userId)
                .transacting(trx);
            queries.push(query);
        });

        Promise.all(queries).then(trx.commit).catch(trx.rollback);
    });

    // remove primaryEmailId as it no longer references anything
    await knex.schema
        .alterTable('users', t => {
            t.dropColumn('primaryEmailId');
        });

    // drop userEmails table
    await knex.schema.dropTableIfExists('userEmails');
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.uuid('primaryEmailId');
        });
    
    await knex.schema
        .createTable('userEmails', t => {
            t.uuid('id')
                .notNullable()
                .primary();
            t.uuid('userId').references('id').inTable('users');
            t.string('email');
            t.boolean('emailVerified');
            t.boolean('deleted');
        });

    const emails = await knex('users')
        .select('id', 'primaryEmailAddress', 'emailVerified');

    await knex.transaction(trx => {
        const queries = [];
        emails.forEach(e => {
            const query = knex('userEmails')
                .insert({
                    id: uuid(),
                    userId: e.id,
                    email: e.primaryEmailAddress,
                    emailVerified: e.emailVerified,
                    deleted: false
                })
                .transacting(trx);
            queries.push(query);
        });
        
        Promise.all(queries).then(trx.commit).catch(trx.rollback);
    });
    
    const emailIds = await knex('userEmails')
        .select('id', 'userId');
    
    await knex.transaction(trx => {
        const queries = [];
        emailIds.forEach(e => {
            const query = knex('users')
                .update({primaryEmailId: e.id})
                .where('id', e.userId)
                .transacting(trx);
            queries.push(query);
        });

        Promise.all(queries).then(trx.commit).catch(trx.rollback);
    });

    await knex.schema
        .alterTable('users', t => {
            t.dropColumn('emailVerified');
        });

    await knex.schema
        .alterTable('emailVerifications', t => {
            t.uuid('userEmailId').references('id').inTable('userEmails');
        });

    await knex.schema
        .alterTable('forgotPasswords', t => {
            t.uuid('userEmailId').references('id').inTable('userEmails');
        });
}