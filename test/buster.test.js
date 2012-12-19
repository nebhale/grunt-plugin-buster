/*jshint node:true*/
'use strict';

var buster = require('buster');
var describe = buster.spec.describe;
var expect = buster.assertions.expect;
var it = buster.spec.it;

var grunt = require('grunt');
var task = require('../src/buster');

describe('A Grunt Buster task', function() {

	it('is registered', function() {
		this.spy(grunt, 'registerTask');

		task(grunt);

		expect(grunt.registerTask).toHaveBeenCalled();
	});
});
