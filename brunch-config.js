module.exports = {
    files: {
        javascripts: {
            joinTo: {
                'villain.js': /^(node_modules)|(app\/js)/
            }
        },
        stylesheets: {
            joinTo: {
                'villain.css': [
                  'node_modules/sweetalert/dist/sweetalert.css',
                  'app/styles/villain.scss',
                ]
            },
        },
    },

    modules: {
        autoRequire: {
            'villain.js': ["villain"]
        },

        globals: {
            $: 'jquery',
            jQuery: 'jquery',
            Villain: 'villain'
        },

        nameCleaner: function(path) {
            return path.replace(/^(app\/js\/)/, '');
        }
    },

    npm: {
        enabled: true,

        styles: {
          sweetalert: ['dist/sweetalert.css'],
        }
    },

    plugins: {
        babel: {
            presets: ['es2015', 'stage-0']
        },
        postcss: {
            processors: [
                require('autoprefixer')(['last 2 versions'])
            ]
        },
        sass: {
            options: {
                includePaths: []
            }
        }
    }
};
