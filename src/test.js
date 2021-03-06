/*
 * test.js - an xUnit-style unit testing framework for JavaScript
 *
 * See LICENSE at the root of this distribution for license details.
 */

var test = (function () {

    // The test module (returned from this function)
    var test = {};

    function fmt(s /*, params...*/) {
        var params = Array.prototype.splice.call(arguments, 1);
        return s.replace(/\{\}/g, function () {
            return params.shift();
        });
    }

    function augment(object, members) {
        for (var m in members) {
            if (members.hasOwnProperty(m)) {
                object[m] = members[m];
            }
        }
    }

    function AssertionError(msg) {
        this.name = 'AssertionError';
        this.message = msg || '';
    }
    AssertionError.prototype = Error.prototype;

    function _assert(cond/*, msgs*/) {
        if (!cond) {
            var msgs = Array.prototype.splice.call(arguments, 1);
            throw new AssertionError(msgs.join('\n    '));
        }
    }
                
    var assertions = {
        assert: function (value, msg) {
            _assert(value, '' + value, msg);
        },
        assertFalse: function (value, msg) {
            _assert(!value, '' + value, msg);
        },
        assertEqual: function (expected, actual, msg) {
            _assert(
                expected == actual,
                fmt('`{}` != `{}`', expected, actual),
                msg);
        },
        assertNotEqual: function (expected, actual, msg) {
            _assert(
                expected != actual,
                fmt('`{}` == `{}`', expected, actual),
                msg);
        },
        assertMembersEqual: function (expected, actual, msg) {
            var nExpectedProps = 0, nActualProps = 0;
            for (var m in expected) {
                if (expected.hasOwnProperty(m)) {
                    nExpectedProps++;
                    _assert(
                        actual.hasOwnProperty(m),
                        fmt('missing property {}', m),
                        msg);
                    this.assertEqual(expected[m], actual[m], msg);
                }
            }
            for (m in actual) {
                if (actual.hasOwnProperty(m)) {
                    nActualProps++;
                }
            }
            _assert(
                nExpectedProps === nActualProps,
                fmt('expected {} props, got {}', nExpectedProps, nActualProps),
                msg);
        },
        assertDoublesEqual: function (expected, actual, delta, msg) {
            _assert(
                Math.abs(expected - actual) <= delta,
                fmt('|{} - {}| > {}', expected, actual, delta),
                msg);
        },
        assertIdentical: function (expected, actual, msg) {
            _assert(
                expected === actual,
                fmt('`{}` !== `{}`', expected, actual),
                msg);
        },
        assertNotIdentical: function (expected, actual, msg) {
            _assert(
                expected !== actual,
                fmt('`{}` === `{}`', expected, actual),
                msg);
        },
        assertNull: function (value, msg) {
            this.assertIdentical(null, value, msg);
        },
        assertNotNull: function (value, msg) {
            this.assertNotIdentical(null, value, msg);
        },
        assertUndefined: function (value, msg) {
            this.assertIdentical(undefined, value, msg);
        },
        assertNotUndefined: function (value, msg) {
            this.assertNotIdentical(undefined, value, msg);
        },
        assertArraysEqual: function (expected, actual, msg) {
            var errMsg = fmt('[{}] != [{}]', expected, actual);
            _assert(expected.length === actual.length, errMsg, msg);
            for (var i = 0; i < expected.length; i++) {
                _assert(expected[i] == actual[i], errMsg, msg);
            }
        },
        assertThrows: function (fn, errorName, msg) {
            try {
                fn.call(this);
            } catch (e) {
                _assert(
                    e.name === errorName,
                    fmt('unexpected error: {}', errorName),
                    msg);
                return;
            }
            this.fail(fmt('Expecting error {}', errorName));
        },
        fail: function (msg) {
            throw new AssertionError(msg);
        }
    };
    // Synonyms
    assertions.assertTrue = assertions.assert;
    // Expose through module object
    augment(test, assertions);

    function TestResults(passes, failures, errors) {
        this.passes = passes || 0;
        this.failures = failures || 0;
        this.errors = errors || 0;
    }
    TestResults.prototype.total = function () {
        return this.passes + this.failures + this.errors;
    };
    TestResults.prototype.add = function (result) {
        return new TestResults(
            this.passes + result.passes,
            this.failures + result.failures,
            this.errors + result.errors
        );
    };

    // The base test case constructor
    function TestCase() {}
    // Users to override as required
    TestCase.prototype.setUp = function () {};
    TestCase.prototype.tearDown = function () {};
    // Provide assertions
    augment(TestCase.prototype, assertions);
    // Provide logging
    TestCase.prototype.log = function () {
        test.log.apply(test, arguments);
    };

    // A simple way of grouping TestCases into a (nestable) hierarchy.
    function TestSuite(members) {
        augment(this, members);

        this.run = function () {
            var results = new TestResults();
            this.setUp();
            for (var m in members) {
                if (members.hasOwnProperty(m) &&
                    !/^(setUp|tearDown)$/.test(m)) {
                    results = results.add(members[m].run());
                }
            }
            this.tearDown();
            return results;
        };
    }
    // Users to override as required
    TestSuite.prototype.setUp = function () {};
    TestSuite.prototype.tearDown = function () {};

    /**
     * Creates and runs concrete TestCase instances.
     */
    function TestCaseRunner(testCaseConstructor, testMethodNames) {
        this.run = function () {
            var results = new TestResults();
            for (var i = 0, len = testMethodNames.length; i < len; i++) {
                var methodName = testMethodNames[i];
                /*
                 * Operate on a fresh instance so tests can't interfere
                 * with each other. Intermediate var is for JSLint's sake.
                 */
                var UserTestCase = testCaseConstructor;
                var testCase = new UserTestCase();
                try {
                    testCase.setUp();
                    testCase[methodName]();
                    results.passes++;
                } catch (e) {
                    if (e.name === 'AssertionError') {
                        test.log('[Failure] {}: {}', methodName, e.message);
                        results.failures++;
                    } else {
                        test.log('[Error] {}: {}', methodName, e);
                        results.errors++;
                    }
                    test.log('---');
                } finally {
                    testCase.tearDown();
                }
            }
            return results;
        };
    }

    var tests = [];

    /**
     * Queues a runnable test for future execution.
     */
    test.add = function (t) {
        tests.push(t);
    };

    /*
     * Writes a message to some environment-specific location. This could be a
     * console, a file, an HTML element or anything else. The function should be
     * specified by the bootstrap script via test.setPrintFn(fn).
     */
    var print = function (msg) {
        throw new Error('not implemented: set print function ' +
                        'via test.setPrintFn(fn)');
    };

    test.setPrintFn = function (fn) {
        print = fn;
    };

    /*
     * Loads a JavaScript file relative to the currently executing test script.
     * This function should be specified by the test runner via
     * test.setLoadFn(fn).
     */
    test.load = function (path) {
        throw new Error('not implemented: set load function ' +
                        'via test.setLoadFn(fn)');
    };

    test.setLoadFn = function (fn) {
        test.load = fn;
    };

    /**
     * Logs a formatted message using the environment-specific print function.
     * Parameters replace occurrences of '{}' in the first argument, e.g.:
     *
     * test.log('{}, {}!', 'Hello', 'world') -> 'Hello, world!'
     */
    test.log = function (/*s, params...*/) {
        print(fmt.apply(null, arguments));
    };

    /**
     * Creates and returns runnable test cases from the given object's members.
     *
     * Rather than construct a single TestCase object, this method creates a
     * constructor function that will be used to create future TestCase
     * instances. This allows us to create a new TestCase for each testXXX()
     * method invocation.
     *
     * The constructor is wrapped in a TestCaseRunner, which is returned from
     * this function.
     *
     * Example usage:
     *
     *   test.testCase({
     *       setUp: function () { ... },
     *       testFoo: function () { this.assert(true); },
     *       tearDown: function () { ... }
     *   });
     */
    test.testCase = function (members) {
        function UserTestCase() {
            augment(this, members);
        }
        UserTestCase.prototype = new TestCase();
        // Find testXXX methods
        var testMethods = [];
        for (var m in members) {
            if (members.hasOwnProperty(m) &&
                typeof members[m] === 'function' &&
                /^test/.test(m)) {
                testMethods.push(m);
            }
        }
        return new TestCaseRunner(UserTestCase, testMethods);
    };

    /**
     * Creates and returns runnable test suites.
     *
     * Example usage:
     *
     *   test.testSuite({
     *       setUp: function () { ... },
     *       case1: test.testCase({ ... }),
     *       case2: test.testSuite({ ... }),
     *       tearDown: function () { ... }
     *   });
     */
    test.testSuite = function (members) {
        return new TestSuite(members);
    };

    /**
     * Creates and registers test cases for future execution. See testCase().
     */
    test.addTestCase = function (members) {
        this.add(this.testCase(members));
    };

    /**
     * Creates and registers runnable test suites for future execution. See
     * testSuite().
     */
    test.addTestSuite = function (members) {
        this.add(this.testSuite(members));
    };

    /**
     * Runs all tests and returns the results.
     */
    test.run = function () {
        var results = new TestResults();
        for (var i = 0, len = tests.length; i < len; i++) {
            results = results.add(tests[i].run());
        }
        return results;
    };

    return test;
}());
