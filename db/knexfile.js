 const config = {
    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: '5432',
            user: 'reperio',
            password: 'reperio',
            database: 'reperio_platform_dev',
            dateStrings: true,
            typeCast: (field, next) => {
                //console.log('TypeCasting', field.type, field.length);
                if (field.type === 'TINY' && field.length === 1) {
                    let value = field.string();
                    return value ? (value === '1') : null;
                }
                return next();
            }
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: __dirname + '/migrations'
        }
    },
    test: {
        client: 'pg',
        connection: {
            host: process.env.PG_CONNECTION_HOST,
            database: "phone_provisioner",
            user: process.env.PG_CONNECTION_USER,
            timezone: 'UTC',
            dateStrings: true,
            typeCast: (field, next) => {
                //console.log('TypeCasting', field.type, field.length);
                if (field.type === 'TINY' && field.length === 1) {
                    let value = field.string();
                    return value ? (value === '1') : null;
                }
                return next();
            }
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: __dirname + '/migrations'
        },
        seeds: {
            directory: __dirname + '/seeds'
        }
    },
    production: {
        client: 'mysql',
        connection: {
            host: 'localhost',
            user: 'reperio',
            password: 'mlQMLA6wbLMJwdCO',
            database: 'reperio_platform_dev',
            timezone: 'UTC',
            dateStrings: true,
            typeCast: (field, next) => {
                //console.log('TypeCasting', field.type, field.length);
                if (field.type === 'TINY' && field.length === 1) {
                    let value = field.string();
                    return value ? (value === '1') : null;
                }
                return next();
            }
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: __dirname + '/migrations'
        }
    }
};

module.exports = config;
