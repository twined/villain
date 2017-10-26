const fs = require("fs");
const path = require("path");
const alias = require("rollup-plugin-alias");
const babel = require("rollup-plugin-babel");
const json = require("rollup-plugin-json");
const scss = require("rollup-plugin-scss");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const CleanCSS = require("clean-css");
const inject = require('rollup-plugin-inject');
const { camelCase } = require("lodash");
const { name, dependencies } = require("../package.json");

const base = path.resolve(__dirname, "..");
const js = path.resolve(base, "lib/js");
const dist = path.resolve(base, "dist");

// Ensure dist directory exists
if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

module.exports = {
    input: path.resolve(js, "index.js"),
    // Libs in `external` will not be bundled to dist,
    // since they are expected to be provided later.
    // We want to include Popper.js in the build, so we exclude it here.
    // external: Object.keys(dependencies).filter(dep => dep !== "popper.js"),
    name,
    globals: {
      jquery: "jQuery"
    },
    plugins: [
        alias({
          '@': js
        }),
        scss({
          output: path.resolve(dist, name + ".css"),
          insert: true,
			    include: '**/*.scss',
			    exclude: [],
          includePaths: ['node_modules']
        }),
        inject({
          // control which files this plugin applies to
          // with include/exclude
          include: 'node_modules/trumbowyg/**/*.js',
          // exclude: 'node_modules/**',

          /* all other options are treated as modules...*/

          // use the default – i.e. insert
          // import $ from 'jquery'
          jQuery: 'jquery'
        }),
        resolve({
          browser: true,
          preferBuiltins: false
        }),
        commonjs({
          // ignoreGlobal: true
        }),
        json(),
        babel({exclude: 'node_modules/**'}),
    ],
    output: [
        {
            format: "es",
            file: path.resolve(dist, name + ".esm.js"),
            sourcemap: true
        }
    ]
};
