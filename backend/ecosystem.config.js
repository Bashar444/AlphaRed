require('dotenv').config({ path: __dirname + '/.env.production' });

module.exports = {
    apps: [
        {
            name: 'primodata-api',
            script: 'dist/src/main.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 4000,
                DATABASE_URL: process.env.DATABASE_URL,
                JWT_SECRET: process.env.JWT_SECRET,
                JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
                REDIS_URL: process.env.REDIS_URL,
            },
            max_memory_restart: '500M',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: '/var/log/pm2/primodata-error.log',
            out_file: '/var/log/pm2/primodata-out.log',
            merge_logs: true,
        },
    ],
};
