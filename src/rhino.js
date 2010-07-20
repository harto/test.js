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

    function dirname(path) {
        // TODO: support non-POSIX path separators?
        var dir = path.substring(0, path.lastIndexOf('/'));
        return dir || '.';
    }

    // Load each script from command-line
    args.forEach(function (scriptPath) {
        // provide load() relative to executing script dir
        // TODO: don't load scripts multiple times? maybe
        var dir = dirname(scriptPath);
        test.setLoadFn(function (/*resources*/) {
            var resources = Array.prototype.slice.call(arguments);
            resources.forEach(function (path) {
                var fullPath = dir + '/' + path;
                test.log('    loading {}', path);
                load(fullPath);
            });
        });

        // execute test script with rebound test.load() function
        test.log('loading {}', scriptPath);
        load(scriptPath);
    });

    var results = test.run();
    test.log('{} tests run', results.total());
    test.log('{} passed, {} failed, {} errors',
             results.passes, results.failures, results.errors);

}(arguments));