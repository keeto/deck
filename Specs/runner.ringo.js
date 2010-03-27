/*
---
script: runner.ringo.js
description: spec runner for ringojs/helma-ng
license: MIT-style license
authors:
- Mark Obcena
...
*/

// Add sources to require path
require.paths.unshift('./../Source/');

// Initialize objects
var Testigo = require('./lib/testigo/testigo').Testigo,
	Tests = new Testigo(),
	Runner = new Testigo.Runners.Simple('ringo', Tests);

// Import test cases
require('./tests').setup(Tests, global, 'ringo');

// Run tests
Runner.run();