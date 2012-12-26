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
var it = buster.spec.it;

var grunt = require('grunt');
var ChildFactory = require('../../tasks/support/child-factory');

describe('A ChildFactory', function() {

	var childFactory;
	var error;
	var write;

	before(function() {
		error = this.spy();
		write = this.spy();
		childFactory = new ChildFactory({
			error: error,
			write: write
		});
	});

	it('directs stdout', function(done) {
		var child = childFactory.create('pwd', ['-P']);

		child.stdout.once('data', function (data) {
			expect(write).toHaveBeenCalledWith(data.toString());
			done();
		});
	});

	it('directs stderr', function(done) {
		var child = childFactory.create('pwd', ['-A']);

		child.stderr.once('data', function (data) {
			expect(error).toHaveBeenCalledWith(data.toString());
			done();
		});
	});
});
