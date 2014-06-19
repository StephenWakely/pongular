'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jasmine_node: {
			options: {
				extensions: 'js',
				specNameMatcher: 'Spec'
			},
			test: [
				'test/'
			]
		},
		watch: {
			test: {
				files: ['lib/**/*.js', 'test/**/*Spec.js', 'examples/**/*.js'],
				tasks: ['jasmine_node:test']
			}
		}
	});
	
	grunt.registerTask('ci', ['jasmine_node:test']);
	grunt.registerTask('test', ['jasmine_node:test', 'watch:test']);
	grunt.registerTask('default', ['test']);
};