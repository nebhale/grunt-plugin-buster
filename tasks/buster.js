/*
 * Copyright 2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jshint node:true*/
'use strict';

var ChildFactory = require('./support/child-factory');
var ConfigurationUtils = require('./support/configuration-utils');
var ExecutableFinder = require('./support/executable-finder');
var path = require('path');
var PhantomJsLifecycle = require('./support/phantomjs-lifecycle');
var ServerLifecycle = require('./support/server-lifecycle');
var TestRunner = require('./support/test-runner');
var when = require('when');

module.exports = function(grunt) {

	grunt.registerMultiTask('buster', 'Run BusterJS tests', function() {
		var options = this.options({
			config: path.resolve('test', 'buster.js'),
			port: 1111,
			reporter: 'dots'
		});

		var childFactory = new ChildFactory(grunt.log);
		var configurationUtils = new ConfigurationUtils(options.config, this.target);
		var executableFinder = new ExecutableFinder();
		var phantomJsLifecycle = new PhantomJsLifecycle(configurationUtils, grunt.verbose, options.port);
		var serverLifecycle = new ServerLifecycle(childFactory, configurationUtils, executableFinder, grunt.verbose, options.port);
		var testRunner = new TestRunner(childFactory, configurationUtils, executableFinder, options.port, options.reporter);

		var done = this.async();

		var startServerPromise = serverLifecycle.start();
		var startPhantomJsPromise = phantomJsLifecycle.start(startServerPromise);
		var runTestsPromise = testRunner.run(startPhantomJsPromise);
		var stopPhantomJsPromise = phantomJsLifecycle.stop(runTestsPromise);
		var stopServerPromise = serverLifecycle.stop(stopPhantomJsPromise);

		when(stopServerPromise, function() {
			done();
		}, function(argument) {
			grunt.log.error(argument);
			done(false);
		});
	});

};
