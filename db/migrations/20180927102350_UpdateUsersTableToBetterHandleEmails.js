exports.up = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.dropColumn('primaryEmailVerified');
            t.dropColumn('primaryEmail');
        });

    await knex.schema
        .alterTable('users', t => {
            t.uuid('primaryEmailId').references('id').inTable('userEmails')
                .nullable();
            t.string('primaryEmailAddress');
        });

    await knex.schema
        .alterTable('userEmails', t => {
            t.unique('email');
        });
        
    await knex.schema
        .alterTable('emailVerifications', t => {
            t.uuid('userId').references('id').inTable('users');
            t.dateTime('triggeredAt');
        });
};

exports.down = async function(knex, Promise) {
    await knex.schema
        .alterTable('users', t => {
            t.dropColumn('primaryEmailId');
            t.dropColumn('primaryEmailAddress');
        });

    await knex.schema
        .alterTable('users', t => {
            t.string('primaryEmail');
            t.boolean('primaryEmailVerified');
        });

    await knex.schema
        .alterTable('userEmails', t => {
            t.dropUnique('email');
        });

    await knex.schema
        .alterTable('emailVerifications', t => {
            t.dropColumn('userId');
            t.dropColumn('triggeredAt');
        });
};