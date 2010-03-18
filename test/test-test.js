/*
 * Unit tests for test.js.
 *
 * See LICENSE at the root of this distribution for license details.
 */

/*global test */

/**
 * Test assertions
 */
test.addTestCase({
    assertBadAssertion: function (fn) {
        this.assertThrows(fn,
                          'AssertionError',
    		          'Expected assertion error: ' + fn);
    },
    assertGoodAssertion: function (fn) {
        // just execute - no errors should occur
        fn.apply(this);
    },
    assertBadAssertions: function (badAssertions) {
        for (var a in badAssertions) {
            this.assertBadAssertion(badAssertions[a]);
        }
    },
    assertGoodAssertions: function (goodAssertions) {
        for (var a in goodAssertions) {
            this.assertGoodAssertion(goodAssertions[a]);
        }
    },
    testAssert: function () {
        var trues = [true, 1, 'foo', {}, []];
        var falses = [false, undefined, null, 0, ''];
        for (var v in trues) {
            this.assertGoodAssertion(function () { this.assert(trues[v]); });
        }
        for (v in falses) {
            this.assertBadAssertion(function () { this.assert(falses[v]); });
        }
    },
    testAssertEqual: function () {
        /*
         * Returns a bunch of functions that exercise the given assertion,
         * using logically equal values as input.
         */
        function createEqualityAssertions(assertion) {
            return [
                function () { assertion.call(this, 0, ''); },
                function () { assertion.call(this, 0, '0'); },
                function () { assertion.call(this, 0, 0); },
                function () { assertion.call(this, null, undefined); }
            ];
        }
        /*
         * Returns a bunch of functions that exercise the given assertion,
         * using logically inequal values as input.
         */
        function createInequalityAssertions(assertion) {
            return [
                function () { assertion.call(this, 1, 2); }
            ];
        }

        this.assertGoodAssertions(createEqualityAssertions(this.assertEqual));
        this.assertGoodAssertions(createInequalityAssertions(this.assertNotEqual));
        this.assertBadAssertions(createEqualityAssertions(this.assertNotEqual));
        this.assertBadAssertions(createInequalityAssertions(this.assertEqual));
    },
    testAssertIdentical: function () {
        this.assertGoodAssertions([
            function () { this.assertIdentical(0, 0); },
            function () { this.assertIdentical('foo', 'foo'); }
        ]);
        // TODO: test bad assertions?
    },
    testAssertNull: function () {
        var notNulls = [undefined, false, 0, ''];

        this.assertGoodAssertion(function () { this.assertNull(null); });
        this.assertBadAssertion(function () { this.assertNotNull(null); });

        for (var i = 0; i < notNulls.length; i++) {
            this.assertGoodAssertion(
                function () { this.assertNotNull(notNulls[i]); }
            );
            this.assertBadAssertion(
                function () { this.assertNull(notNulls[i]); }
            );
        }
    },
    testAssertUndefined: function () {
        this.assertGoodAssertion(
            function () { this.assertUndefined(undefined); }
        );
        this.assertBadAssertions([
            function () { this.assertUndefined(null); },
            function () { this.assertUndefined(false); }
        ]);
    },
    testAssertNotUndefined: function () {
        this.assertGoodAssertions([
            function () { this.assertNotUndefined(null); },
            function () { this.assertNotUndefined(false); }
        ]);
        this.assertBadAssertion(
            function () { this.assertNotUndefined(undefined); }
        );
    },
    testAssertArraysEqual: function () {
        this.assertGoodAssertion(function () {
            this.assertArraysEqual([1, 2, 3], [1, '2', 3]);
        });
        this.assertBadAssertion(function () {
            this.assertArraysEqual([1, 3, 2], [1, 2, 3]);
        });
    },
    testFail: function () {
        this.assertBadAssertion(function () { this.fail(); });
    },
    testAssertThrows: function () {
        function errorThrower() {
            throw new Error('oops');
        }
        this.assertThrows(errorThrower, 'Error');
    }
});

/**
 * Test basic method name recognition and order of execution.
 */
test.addTestCase({
    /**
     * Check ordering of case setUp/tearDown and test methods.
     */
    testTestCaseMethodInvocation: function () {
        // Only setUp, testXXX and tearDown should be executed.
        var methodNames = ['quux', 'tearDown', 'setUp', 'testFoo', 'testBar'];
        var invoked = [];
        var tests = {};
        for (var k in methodNames) {
            // Create a test case method of the given name that simply pushes
            // the method name onto the 'invoked' array. Doing this inside an
            // anonymous fn avoids closing over the loop variable.
            (function (methodName) {
                tests[methodName] = function () { invoked.push(methodName); };
            }(methodNames[k]));
        }
        var testCase = test.testCase(tests);

        testCase.run();

        var expected = [
            'setUp', 'testFoo', 'tearDown',
            'setUp', 'testBar', 'tearDown'
        ];
        this.assertArraysEqual(expected, invoked);
    },
    /**
     * Check ordering of suite setUp/tearDown and nested cases.
     */
    testTestSuiteMethodInvocation: function () {
        var invoked = [];
        var suite = test.testSuite({
            setUp: function () { invoked.push('setUpSuite'); },
            tearDown: function () { invoked.push('tearDownSuite'); },
            case1: test.testCase({
    	        setUp: function () { invoked.push('setUpCase'); },
    	        test1: function () { invoked.push('test1'); },
    	        tearDown: function () { invoked.push('tearDownCase'); }
            }),
            case2: test.testCase({
    	        test2: function () { invoked.push('test2'); }
            })
        });

        suite.run();

        var expected = [
            'setUpSuite',
            'setUpCase',
            'test1',
            'tearDownCase',
            'test2',
            'tearDownSuite'
        ];
        this.assertArraysEqual(expected, invoked);
    },
    testCaseDefaultSetUpAndTearDown: function () {
        var testCase = test.testCase({});
        testCase.run();
        // should complete without error
    },
    testSuiteDefaultSetUpAndTearDown: function () {
        var suite = test.testSuite({});
        suite.run();
        // should complete without error
    }
});

/**
 * Test messages from failed assertions. TODO: Finish
 */
test.addTestCase({
    captureLogMessage: function (fn) {
        var oldLogFn = test.log;
        var captured;
        test.log = function (msg) {
            captured = msg;
        };
        try {
            fn.apply(this);
        } catch (e) {
            // swallow exception
        } finally {
            test.log = oldLogFn;
            return captured;
        }
    }//,
//     testAssertWithMessage: function () {
//     var msg = 'foo';
//     this.assertIdentical(
//         '[Failure] testAssertWithMessage: ' + msg,
//         this.captureLogMessage(function () { this.assert(false, msg); }));
//     }
});
