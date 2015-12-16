module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            node: {
                options : {
                    node: true,
                },
                src: [ 'index.js', 'nodejs_src/astro_ephemeris.js' ],
            }
        },
        jscs: {
            src: [ 'index.js', 'nodejs_src/astro_ephemeris.js' ],
        },
        release: {
            options: {
                commitFiles: [
                    'package.json',
                ],
                tagName: "v<%= version %>",
                commitMessage: 'Updated for release v<%= version %>',
                tagMessage: 'Release v<%= version %>',
                npm: false
            }
        },
        mochacli : {
            test: {
                src: ['test/**/*.js'],
            },
        },
        gyp : {
            astro_ephemeris_details : {}
        },
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-node-gyp');

    grunt.registerTask( 'build', ['gyp', 'jshint', 'jscs', 'mochacli'] );
    grunt.registerTask( 'default', ['build'] );
};