require('dotenv').config()

module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD
        },
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
        connection: {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: __dirname + '/migrations'
        }
    }
};
