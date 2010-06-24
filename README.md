test.js - an xUnit-style unit testing framework for JavaScript
==============================================================

test.js is a lightweight, environment-agnostic framework that provides a
traditional xUnit-style API. It may be run from within a browser, from a
command-line, or anywhere else (provided that a bootstrap script is written).

Only a Rhino-based test runner exists at this stage. This distribution also
includes Rhino JAR files.

Launching Rhino test runner
---------------------------

Launching the Rhino-based test runner:

    $ bin/test.js <my-test-scripts>

Running self-testing unit tests:

    $ bin/self-test

Writing tests
-------------
   
See examples/ for common use cases.

(TODO: document assertions)
