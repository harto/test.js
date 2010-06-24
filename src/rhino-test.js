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

    // Attach Rhino-specific functions
    test.setPrintFn(print);

    var i, path, dir;
    for (i = 0; i < args.length; i++) {
        path = args[i];

        // push directory while script executes
        // TODO: support non-POSIX path separators
        // TODO: don't load scripts multiple times? maybe
        dir = path.substring(0, path.lastIndexOf('/'));
        test.setLoadFn(function (path) {
            var fullPath = dir + '/' + path;
            test.log('loading {}', fullPath);
            load(fullPath);
        });

        // execute test script with rebound test.load() function
        load(path);
    }

    var results = test.run();
    test.log('{} tests run', results.total());
    test.log('{} passed, {} failed, {} errors',
             results.passes, results.failures, results.errors);

}(arguments));