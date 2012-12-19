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

var childProcess = require('child_process');
var path = require('path');
var phantom = require('node-phantom');
var when = require('when');
var _ = require('lodash');

module.exports = function(grunt) {

	var phantomJs;
	var server;

	function findExecutable(executable, callback) {
		childProcess.exec('command -v ' + executable, {
			env: {
				PATH: path.resolve('node_modules', '.bin') + ':' + process.env.PATH
			}
		}, function(error, stdout) {
			callback(stdout.split('\n')[0]);
		});
	}

	function spawnChild(exec, args) {
		var child = childProcess.spawn(exec, args, {
			env: process.env,
			setsid: true
		});

		child.stdout.on('data', function(data) {
			grunt.log.write(data.toString());
		});

		child.stderr.on('data', function(data) {
			grunt.log.error(data.toString());
		});

		return child;
	}

	function startServer(options) {
		var deferred = when.defer();

		findExecutable('buster-server', function(exec) {
			var args = [];
			if(options.port) {
				args.push('--port', options.port);
			}

			server = spawnChild(exec, args);

			server.stdout.once('data', function() {
				deferred.resolve();
			});

			server.stderr.once('data', function() {
				deferred.reject();
			});
		});

		return deferred.promise;
	}

	function startPhantomJs(startServerPromise, options) {
		var deferred = when.defer();

		when(startServerPromise, function() {
			grunt.verbose.write('PhantomJS client starting...');
			phantom.create(function(err, ph) {
				phantomJs = ph;

				phantomJs.createPage(function(err, page) {
					page.open('http://localhost:' + options.port + '/capture', function() {
						grunt.verbose.ok();
						deferred.resolve();
					});
				});
			});
		}, function() {
			deferred.reject();
		});

		return deferred.promise;
	}

	function runTests(startPhantomJsPromise, options) {
		var deferred = when.defer();

		when(startPhantomJsPromise, function() {
			findExecutable('buster-test', function(exec) {
				var args = [];
				if(options.config) {
					args.push('--config', options.config);
				}
				if(options.groups) {
					_.each(options.groups, function(group) {
						args.push('--config-group', group);
					});
				}
				if(options.port) {
					args.push('--server', 'http://localhost:' + options.port);
				}
				if(options.reporter) {
					args.push('--reporter', options.reporter);
				}

				var test = spawnChild(exec, args);
				test.on('exit', function(code) {
					if(code) {
						deferred.reject();
					} else {
						deferred.resolve();
					}
				});
			});
		}, function() {
			deferred.reject();
		});

		return deferred.promise;
	}

	function stopPhantomJs(runTestsPromise) {
		var deferred = when.defer();

		function stop(callback) {
			grunt.verbose.write('PhantomJS client stopping...');
			phantomJs.exit(function() {
				grunt.verbose.ok();
				callback();
			});
		}

		when(runTestsPromise, function() {
			stop(deferred.resolve);
		}, function() {
			stop(deferred.reject);
		});

		return deferred.promise;
	}

	function stopServer(stopPhantomJsPromise) {
		var deferred = when.defer();

		function stop(callback) {
			grunt.verbose.write('BusterJS server stopping...');

			server.on('exit', function() {
				grunt.verbose.ok();
				callback();
			});

			server.kill();
		}

		when(stopPhantomJsPromise, function() {
			stop(deferred.resolve);
		}, function() {
			stop(deferred.reject);
		});

		return deferred.promise;
	}

	grunt.registerTask('buster', 'Run BusterJS tests', function() {
		var done = this.async();
		var options = this.options();

		var startServerPromise = startServer(options);
		var startPhantomJsPromise = startPhantomJs(startServerPromise, options);
		var runTestsPromise = runTests(startPhantomJsPromise, options);
		var stopPhantomJsPromise = stopPhantomJs(runTestsPromise);
		var stopServerPromise = stopServer(stopPhantomJsPromise);

		when(stopServerPromise, function() {
			done();
		}, function() {
			done(false);
		});
	});

};
