require('dotenv').config()

module.exports = {
    development: {
        client: 'pg',
        connection: process.env.POSTGRES_URL,
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: __dirname + '/migrations'
        }
    },
    production: {
        client: 'pg',
        connection: process.env.POSTGRES_URL + "?ssl=true",
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: __dirname + '/migrations'
        }
    }
};
