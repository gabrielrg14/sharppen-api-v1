// const { db } = require('./.env')

module.exports = {
    development: {
        client: 'postgresql',
        connection: db,
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: __dirname + '/migrations',
        }
    }
};
