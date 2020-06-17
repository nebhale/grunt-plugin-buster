# grunt-plugin-buster
[![Build Status](https://travis-ci.org/nebhale/grunt-plugin-buster.svg?branch=master)](https://travis-ci.org/nebhale/grunt-plugin-buster)
[![Dependency Status](https://gemnasium.com/nebhale/grunt-plugin-buster.svg)](https://gemnasium.com/nebhale/grunt-plugin-buster)
[![Code Climate](https://codeclimate.com/github/nebhale/grunt-plugin-buster.svg)](https://codeclimate.com/github/nebhale/grunt-plugin-buster)

Run BusterJS tests

## Getting Started
_If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide._

From the same directory as your project's [Gruntfile][Getting Started] and [package.json][], install this plugin with the following command:

```bash
npm install grunt-plugin-buster --save-dev
```

Once that's done, add this line to your project's Gruntfile:

```js
grunt.loadNpmTasks('grunt-plugin-buster');
```

If the plugin has been installed correctly, running `grunt --help` at the command line should list the newly-installed plugin's task or tasks. In addition, the plugin should be listed in package.json as a `devDependency`, which ensures that it will be installed whenever the `npm install` command is run.

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md
[package.json]: https://npmjs.org/doc/json.html

## Buster task
_Run this task with the `grunt buster` command._

This task starts a BusterJS server and a PhantomJS instance (if `browser` tests), runs all specified tests, and the shuts down the PhantomJS instance and BusterJS server (if they were started).

### Options

#### `config`
Type: `string`
Default: `test/buster.js`

This option sets the BusterJS configuration file to use when running tests.  This is the equivalent to using the `-c/--config` option with the `buster-test` cli.

#### `port`
Type: `number`
Default: `1111`

This option sets the BusterJS server port to use when running browser tests.  This is the equivalent to using the `--port` option with the `buster-server` cli and the `-s/--server` option with the `buster-test` cli.

#### `reporter`
Type: `string`
Default: `dots`

This option sets the BusterJS test output reporter to use when running tests.  This is the equivalent to using the `-r/--reporter` option with the `buster-test` cli.

### Usage Examples

#### Typical
For typical usage, simply defining the name of config group (same as in your buster config) is all that is required:

```js
buster: {
	app: {}
}
```

Buster config file:
```js
var config = module.exports;

config.app = {
  ...
};
```

#### Non-standard
If the project being tested is non-standard, configuration would look like the following:

```js
buster: {
	app: {},
	options: {
		config: 'test/another.buster.js',
		groups: ['alpha-group', 'bravo-group'],
		port: 2222,
		reporter: 'specification'
	}
}
```
