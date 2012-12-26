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


function ServerLifecycle(childFactory, configurationUtils, executableFinder, log, port) {
	this._childFactory = childFactory;
	this._configurationUtils = configurationUtils;
	this._executableFinder = executableFinder;
	this._log = log;
	this._port = port;
}

ServerLifecycle.prototype.start = function(previous) {
	var deferred = when.defer();

	when(previous, function() {
		if(this._configurationUtils.isBrowser()) {
			this._executableFinder.find('buster-server', function(err, executable) {
				if(err) {
					deferred.reject(err);
				} else {
					this._server = this._childFactory.create(executable, ['--port', this._port]);

					this._server.stdout.once('data', function() {
						deferred.resolve();
					});

					this._server.stderr.once('data', function(data) {
						deferred.reject(data.toString());
					});
				}
			}.bind(this));
		} else {
			this._log.writeln('Skipping BusterJS server start');
			deferred.resolve();
		}
	}.bind(this), function(argument) {
		deferred.reject(argument);
	});

	return deferred.promise;
};

ServerLifecycle.prototype.stop = function(previous) {
	var deferred = when.defer();

	when(previous, this._stop.bind(this, deferred.resolve), this._stop.bind(this, deferred.reject));

	return deferred.promise;
};

ServerLifecycle.prototype._stop = function(callback, argument) {
	if(this._server) {
		this._log.write('BusterJS server stopping...');

		this._server.on('exit', function () {
			this._log.ok();
			callback(argument);
		}.bind(this));

		this._server.kill();
	} else {
		this._log.writeln('Skipping BusterJS server stop');
		callback(argument);
	}
};

module.exports = ServerLifecycle;
