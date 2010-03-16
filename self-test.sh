#!/bin/bash
jslint src/*.js
js -f src/test.js src/rhino-test-runner.js test/test-test.js