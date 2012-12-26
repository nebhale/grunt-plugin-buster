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
var expect = buster.assertions.expect;
var fail = buster.assertions.fail;
var it = buster.spec.it;
var nodePhantom = require('node-phantom');
var when = require('when');

var PhantomJsLifecycle = require('../../tasks/support/phantomjs-lifecycle');


describe('A PhantomJsLifecycle', function() {

	var isBrowser;
	var ok;
	var phantomJsLifecycle;
	var write;
	var writeln;

	before(function() {
		isBrowser = this.stub();
		ok = this.spy();
		write = this.spy();
		writeln = this.spy();

		phantomJsLifecycle = new PhantomJsLifecycle({
			isBrowser: isBrowser
		}, {
			ok: ok,
			write: write,
			writeln: writeln
		}, 12345);
	});

	it('propagates rejection on start', function() {
		var deferred = when.defer();
		deferred.reject('rejection-argument');

		var promise = phantomJsLifecycle.start(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('rejection-argument');
		});
	});

	it('skips client creation on start if not browser', function() {
		isBrowser.returns(false);

		var deferred = when.defer();
		deferred.resolve();

		var promise = phantomJsLifecycle.start(deferred);
		when(promise, function() {
			expect(write).not.toHaveBeenCalled();
		});
	});

	it('propagates phantom creation error on start', function() {
		isBrowser.returns(true);
		this.stub(nodePhantom, 'create').yields('rejection-argument');

		var deferred = when.defer();
		deferred.resolve();

		var promise = phantomJsLifecycle.start(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('rejection-argument');
		});
	});

	it('propagates page creation error on start', function() {
		var createPage = this.stub();
		var phantom = {
			createPage: createPage
		};

		isBrowser.returns(true);
		this.stub(nodePhantom, 'create').yields(undefined, phantom);
		createPage.yields('rejection-argument');

		var deferred = when.defer();
		deferred.resolve();

		var promise = phantomJsLifecycle.start(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('rejection-argument');
		});
	});

	it('propagates page open error on start', function() {
		var open = this.stub();
		var page = {
			open: open
		};

		var createPage = this.stub();
		var phantom = {
			createPage: createPage
		};

		isBrowser.returns(true);
		this.stub(nodePhantom, 'create').yields(undefined, phantom);
		createPage.yields(undefined, page);
		open.yields('rejection-argument');

		var deferred = when.defer();
		deferred.resolve();

		var promise = phantomJsLifecycle.start(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('rejection-argument');
		});
	});

	it('resolves on start', function() {
		var open = this.stub();
		var page = {
			open: open
		};

		var createPage = this.stub();
		var phantom = {
			createPage: createPage
		};

		isBrowser.returns(true);
		this.stub(nodePhantom, 'create').yields(undefined, phantom);
		createPage.yields(undefined, page);
		open.yields(undefined);

		var deferred = when.defer();
		deferred.resolve();

		var promise = phantomJsLifecycle.start(deferred);
		when(promise, function() {
			expect(open).toHaveBeenCalledWith('http://localhost:12345/capture');
		});
	});

	it('propagates rejection on stop', function() {
		var deferred = when.defer();
		deferred.reject('rejection-argument');

		var promise = phantomJsLifecycle.stop(deferred);
		when(promise, function() {
			fail();
		}, function(argument) {
			expect(argument).toEqual('rejection-argument');
		});
	});

	it('skips client destruction if no client was started', function() {
		var deferred = when.defer();
		deferred.resolve();

		var promise = phantomJsLifecycle.stop(deferred);
		when(promise, function() {
			expect(write).not.toHaveBeenCalled();
		});
	});

	it('resolves on stop', function() {
		var exit = this.stub();
		phantomJsLifecycle._phantom = {
			exit: exit
		};

		exit.yields();

		var deferred = when.defer();
		deferred.resolve();

		var promise = phantomJsLifecycle.stop(deferred);
		when(promise, function() {
			expect(write).toHaveBeenCalled();
			expect(ok).toHaveBeenCalled();
		});
	});

});
