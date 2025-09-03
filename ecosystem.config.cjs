module.exports = {
    apps: [
        {
            name: "fullstack-ai-training-front",
            script: "npx",
            args: "serve dist -s -l 7676",
            cwd: "./",
            exec_mode: "fork",
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: "production",
            },
            pre_start: "npm run build",
        },
    ],
};
