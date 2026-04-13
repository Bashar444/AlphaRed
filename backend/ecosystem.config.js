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
            },
            max_memory_restart: '500M',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: '/var/log/pm2/primodata-error.log',
            out_file: '/var/log/pm2/primodata-out.log',
            merge_logs: true,
        },
    ],
};
