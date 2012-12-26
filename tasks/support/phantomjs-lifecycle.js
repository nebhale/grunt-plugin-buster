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

var nodePhantom = require('node-phantom');
var when = require('when');

function PhantomJsLifecycle(configurationUtils, log, port) {
	this._configurationUtils = configurationUtils;
	this._log = log;
	this._port = port;
}

PhantomJsLifecycle.prototype.start = function(previous) {
	var deferred = when.defer();

	when(previous, function() {
		if(this._configurationUtils.isBrowser()) {
			this._log.write('PhantomJS client starting...');
			nodePhantom.create(function(err, phantom) {
				if(err) {
					deferred.reject(err);
				} else {
					this._phantom = phantom;

					this._phantom.createPage(function(err, page) {
						if(err) {
							deferred.reject(err);
						} else {
							page.open('http://localhost:' + this._port + '/capture', function(err) {
								if(err) {
									deferred.reject(err);
								} else {
									this._log.ok();
									deferred.resolve();
								}
							}.bind(this));
						}
					}.bind(this));
				}
			}.bind(this));
		} else {
			deferred.resolve();
		}
	}.bind(this), function(argument) {
		deferred.reject(argument);
	});

	return deferred.promise;
};

PhantomJsLifecycle.prototype.stop = function(previous) {
	var deferred = when.defer();

	when(previous, this._stop.bind(this, deferred.resolve), this._stop.bind(this, deferred.reject));

	return deferred.promise;
};

PhantomJsLifecycle.prototype._stop = function(callback, argument) {
	if(this._phantom) {
		this._log.write('PhantomJS client stopping...');

		this._phantom.exit(function() {
			this._log.ok();
			callback(argument);
		}.bind(this));
	} else {
		callback(argument);
	}
};

module.exports = PhantomJsLifecycle;
