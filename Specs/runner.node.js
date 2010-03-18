/*
---
script: runner.node.js
description: spec runner for node.js
license: MIT-style license
authors:
- Mark Obcena
...
*/

// Add sources to require path
require.paths.push(process.cwd() + '/../Source/');

// Initialize objects
var Testigo = require('./lib/testigo/testigo').Testigo,
	Tests = new Testigo(),
	Runner = new Testigo.Runners.Simple('node', Tests);

// Import test cases
require('./tests').setup(Tests, GLOBAL, 'node');


// Run tests
Runner.run();