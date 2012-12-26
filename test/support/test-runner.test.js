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

var buster = require('buster');
var before = buster.spec.before;
var describe = buster.spec.describe;
var EventEmitter = require('events').EventEmitter;
var expect = buster.assertions.expect;
var fail = buster.assertions.fail;
var it = buster.spec.it;
var when = require('when');

var TestRunner = require('../../tasks/support/test-runner');

describe('A TestRunner', function() {

	var configurationGroup;
	var configurationLocation;
	var create;
	var find;
	var isBrowser;
	var test;
	var testRunner;

	before(function() {
		configurationGroup = this.stub();
		configurationLocation = this.stub();
		create = this.stub();
		find = this.stub();
		isBrowser = this.stub();
		test = new EventEmitter();

		testRunner = new TestRunner({
			create: create
		}, {
			configurationGroup: configurationGroup,
			configurationLocation: configurationLocation,
			isBrowser: isBrowser
		}, {
			find: find
		}, 12345, 'test-reporter');
	});

	it('propagates rejection on start', function() {
		var deferred = when.defer();
		deferred.reject('rejection-argument');

		var promise = testRunner.run(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('rejection-argument');
		});
	});

	it('rejects on start if buster-test cannot be found', function() {
		find.yields('error-argument');

		var deferred = when.defer();
		deferred.resolve();

		var promise = testRunner.run(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('error-argument');
		});
	});

	it('resolves on run', function() {
		find.yields(undefined, 'buster-test');
		configurationLocation.returns('test-config-location');
		configurationGroup.returns('test-config-group');
		isBrowser.returns(false);
		create.returns(test);

		var deferred = when.defer();
		deferred.resolve();

		var promise = testRunner.run(deferred);
		when(promise, function() {
			expect(create).toHaveBeenCalledWith('buster-test', ['--config', 'test-config-location', '--config-group', 'test-config-group', '--reporter', 'test-reporter']);
		});

		test.emit('exit');
	});

	it('includes a server argument on run when test are browser', function() {
		find.yields(undefined, 'buster-test');
		configurationLocation.returns('test-config-location');
		configurationGroup.returns('test-config-group');
		isBrowser.returns(true);
		create.returns(test);

		var deferred = when.defer();
		deferred.resolve();

		var promise = testRunner.run(deferred);
		when(promise, function() {
			expect(create).toHaveBeenCalledWith('buster-test', ['--config', 'test-config-location', '--config-group', 'test-config-group', '--reporter', 'test-reporter', '--server', 'http://localhost:12345']);
		});

		test.emit('exit');
	});

	it('rejects on run when exit has a non-zero code', function() {
		find.yields(undefined, 'buster-test');
		create.returns(test);

		var deferred = when.defer();
		deferred.resolve();

		var promise = testRunner.run(deferred);
		when(promise, function() {
			fail();
		}, function (argument) {
			expect(argument).toBe(-1);
		});

		test.emit('exit', -1);
	});

});
