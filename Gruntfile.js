/*jshint node:true*/
'use strict';

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.loadTasks('src');

	grunt.initConfig({
		locations: {
			src: ['src/**/*.js'],
			test: ['test/**/*.js']
		},

		jshint: {
			src: '<%= locations.src %>',
			test: '<%= locations.test %>',
			options: {
				jshintrc: '.jshintrc'
			}
		},

		watch: {
			src: {
				files: '<%= locations.src %>',
				tasks: ['buster']
			},

			test: {
				files: '<%= locations.test %>',
				tasks: ['buster']
			}
		}
	});

	grunt.registerTask('precommit', ['jshint', 'buster']);
	grunt.registerTask('test', ['jshint', 'buster']);

};
