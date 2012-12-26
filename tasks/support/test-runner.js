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

var when = require('when');

function TestRunner(childFactory, configurationUtils, executableFinder, port, reporter) {
	this._childFactory = childFactory;
	this._configurationUtils = configurationUtils;
	this._executableFinder = executableFinder;
	this._port = port;
	this._reporter = reporter;
}

TestRunner.prototype.run = function(previous) {
	var deferred = when.defer();

	when(previous, function() {
		this._executableFinder.find('buster-test', function(err, executable) {
			if(err) {
				deferred.reject(err);
			} else {
				var args = [ //
				'--config', this._configurationUtils.configurationLocation(), //
				'--config-group', this._configurationUtils.configurationGroup(), //
				'--reporter', this._reporter //
				];

				if(this._configurationUtils.isBrowser()) {
					args.push('--server', 'http://localhost:' + this._port);
				}

				var test = this._childFactory.create(executable, args);
				test.on('exit', function(code) {
					if(code) {
						deferred.reject(code);
					} else {
						deferred.resolve();
					}
				});
			}
		}.bind(this));
	}.bind(this), function(argument) {
		deferred.reject(argument);
	});

	return deferred;
};

module.exports = TestRunner;
