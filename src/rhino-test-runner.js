/*
 * Rhino test runner for test.js.
 * $Id: rhino-test-runner.js 194 2010-01-31 10:03:29Z stuart $
 */

/*global test */

(function (args) {

    if (!args.length) {
        print('Usage: rhino-test-runner.js <file>.js [<file>.js ...]');
    }

    // Attach Rhino implementations of required methods
    test.print = print;
    test.load = load;

    for (var i = 0; i < args.length; i++) {
        load(args[i]);
    }

    var results = test.run();
    test.log('{} tests run', results.total());
    test.log('{} passed, {} failed, {} errors',
             results.passes, results.failures, results.errors);

}(arguments));