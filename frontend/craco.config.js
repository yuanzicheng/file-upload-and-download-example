const CracoLessPlugin = require('craco-less');

module.exports = {
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: { 
                            'arcoblue-6': '#D91AD9',
                        },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};