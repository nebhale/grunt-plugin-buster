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

var ConfigurationUtils = require('../../tasks/support/configuration-utils');

describe('A ConfigurationUtils', function() {

	it('can determine if a browser is required', function() {
		var configurationUtils = new ConfigurationUtils('./test/support/config.example.js', 'browser');
		expect(configurationUtils.isBrowser()).toBe(true);
	});

	it('can determine if a browser is not required', function() {
		var configurationUtils = new ConfigurationUtils('./test/support/config.example.js', 'node');
		expect(configurationUtils.isBrowser()).toBe(false);
	});

	it('can return the location of the configuration file', function () {
		var configurationUtils = new ConfigurationUtils('./test/support/config.example.js', 'node');
		expect(configurationUtils.configurationLocation()).toEqual('./test/support/config.example.js');
	});

	it('can return the name of the configuration group', function () {
		var configurationUtils = new ConfigurationUtils('./test/support/config.example.js', 'node');
		expect(configurationUtils.configurationGroup()).toEqual('node');
	});

});
