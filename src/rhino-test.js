/*
 * Rhino test runner for test.js.
 *
 * See LICENSE at the root of this distribution for license details.
 */

/*global test */

(function (args) {

    if (!args.length) {
        print('Usage: rhino-test.js <files-and-tests.js> [<file>.js ...]');
    }

    // Attach Rhino implementations of required methods
    test.setPrintFn(print);

    for (var i = 0; i < args.length; i++) {
        load(args[i]);
    }

    var results = test.run();
    test.log('{} tests run', results.total());
    test.log('{} passed, {} failed, {} errors',
             results.passes, results.failures, results.errors);

}(arguments));