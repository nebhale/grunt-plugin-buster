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

var ServerLifecycle = require('../../tasks/support/server-lifecycle');

describe('A ServerLifecycle', function() {

	var create;
	var find;
	var isBrowser;
	var ok;
	var server;
	var serverLifecycle;
	var stderr;
	var stdout;
	var write;
	var writeln;

	before(function() {
		create = this.stub();
		find = this.stub();
		isBrowser = this.stub();
		ok = this.spy();
		server = new EventEmitter();
		server.kill = this.spy();
		stderr = new EventEmitter();
		stdout = new EventEmitter();
		write = this.spy();
		writeln = this.spy();

		serverLifecycle = new ServerLifecycle({
			create: create
		}, {
			isBrowser: isBrowser
		}, {
			find: find
		}, {
			ok: ok,
			write: write,
			writeln: writeln
		}, 12345);
	});

	it('propagates rejection on start', function() {
		var deferred = when.defer();
		deferred.reject('rejection-argument');

		var promise = serverLifecycle.start(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('rejection-argument');
		});
	});

	it('skips server creation on start if not browser', function() {
		isBrowser.returns(false);

		var deferred = when.defer();
		deferred.resolve();

		var promise = serverLifecycle.start(deferred);
		when(promise, function() {
			expect(find).not.toHaveBeenCalled();
		});
	});

	it('rejects on start if buster-server cannot be found', function() {
		isBrowser.returns(true);
		find.yields('error-argument');

		var deferred = when.defer();
		deferred.resolve();

		var promise = serverLifecycle.start(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('error-argument');
		});
	});

	it('resolves on start', function() {
		isBrowser.returns(true);
		find.yields(undefined, 'buster-server');
		create.returns({
			stderr: stderr,
			stdout: stdout
		});

		var deferred = when.defer();
		deferred.resolve();

		var promise = serverLifecycle.start(deferred);
		when(promise, function() {
			expect(create).toHaveBeenCalledWith('buster-server', ['--port', 12345]);
			expect(serverLifecycle._server).toBeDefined();
		});

		stdout.emit('data', 'stdout-data');
	});

	it('rejects on start if stderr is written to', function() {
		isBrowser.returns(true);
		find.yields(undefined, 'buster-server');
		create.returns({
			stderr: stderr,
			stdout: stdout
		});

		var deferred = when.defer();
		deferred.resolve();

		var promise = serverLifecycle.start(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('stderr-data');
		});

		stderr.emit('data', 'stderr-data');
	});

	it('propagates rejection on stop', function () {
		var deferred = when.defer();
		deferred.reject('rejection-argument');

		var promise = serverLifecycle.stop(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('rejection-argument');
		});
	});

	it('skips server destruction if no server was started', function () {
		var deferred = when.defer();
		deferred.resolve();

		var promise = serverLifecycle.stop(deferred);
		when(promise, function() {
			expect(write).not.toHaveBeenCalled();
		});
	});

	it('resolves on stop', function() {
		serverLifecycle._server = server;

		var deferred = when.defer();
		deferred.resolve();

		var promise = serverLifecycle.stop(deferred);
		when(promise, function() {
			expect(write).toHaveBeenCalled();
			expect(ok).toHaveBeenCalled();
			expect(server.kill).toHaveBeenCalled();
		});

		server.emit('exit');
	});

});
