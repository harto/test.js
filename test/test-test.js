/*
 * Unit tests for test.js.
 */

/*global test */

function assertBadAssertion(fn) {
    test.assertThrows(fn,
                      'AssertionError',
    		      'Expected assertion error: ' + fn);
};

function assertGoodAssertion(fn) {
    // just execute - no errors should occur
    fn.apply(test);
};

function assertBadAssertions(badAssertions) {
    for (var a in badAssertions) {
        assertBadAssertion(badAssertions[a]);
    }
};

function assertGoodAssertions(goodAssertions) {
    for (var a in goodAssertions) {
        assertGoodAssertion(goodAssertions[a]);
    }
};

/**
 * Returns a bunch of functions that exercise the given assertion, using
 * logically equal values as input.
 */
function createEqualityAssertions(assertion) {
    return [
        function () { assertion.call(this, 0, ''); },
        function () { assertion.call(this, 0, '0'); },
        function () { assertion.call(this, 0, 0); },
        function () { assertion.call(this, null, undefined); }
    ];
}

/**
 * Creates an array of functions that exercise the given assertion, using
 * logically inequal values as input.
 */
function createInequalityAssertions(assertion) {
    return [
        function () { assertion.call(this, 1, 2); }
    ];
}

/**
 * Test assertions
 */
test.addTestCase({

    testAssert: function () {
        var trues = [true, 1, 'foo', {}, []];
        var falses = [false, undefined, null, 0, ''];
        for (var v in trues) {
            assertGoodAssertion(function () { test.assert(trues[v]); });
        }
        for (v in falses) {
            assertBadAssertion(function () { test.assert(falses[v]); });
        }
    },

    testAssertEqual: function () {
        assertGoodAssertions(createEqualityAssertions(test.assertEqual));
        assertGoodAssertions(createInequalityAssertions(test.assertNotEqual));
        assertBadAssertions(createEqualityAssertions(test.assertNotEqual));
        assertBadAssertions(createInequalityAssertions(test.assertEqual));
    },

    testAssertDoublesEqual: function () {
        assertGoodAssertions([
            function () { test.assertDoublesEqual(2, 2, 0); },
            function () { test.assertDoublesEqual(0.11, 0.12, 0.01); }
        ]);
        assertBadAssertion(
            function () {
                test.assertDoublesEqual(0.11, 0.12, 0.001);
            }
        );
    },

    testAssertMembersEqual: function () {
        assertGoodAssertion(function () {
            test.assertMembersEqual(
                { foo: 3, bar: 'baz' },
                { bar: 'baz', foo: 3 });
        });

        assertBadAssertion(function () {
            test.assertMembersEqual(
                { foo: 3, bar: 'baz' },
                { foo: 3, bar: 'baz', bla: 'quux' });
        });
    },

    testAssertIdentical: function () {
        assertGoodAssertions([
            function () { test.assertIdentical(0, 0); },
            function () { test.assertIdentical('foo', 'foo'); }
        ]);
        // TODO: test bad assertions?
    },

    testAssertNull: function () {
        var notNulls = [undefined, false, 0, ''];

        assertGoodAssertion(function () { test.assertNull(null); });
        assertBadAssertion(function () { test.assertNotNull(null); });

        for (var i = 0; i < notNulls.length; i++) {
            assertGoodAssertion(
                function () { test.assertNotNull(notNulls[i]); }
            );
            assertBadAssertion(
                function () { test.assertNull(notNulls[i]); }
            );
        }
    },

    testAssertUndefined: function () {
        assertGoodAssertion(
            function () { test.assertUndefined(undefined); }
        );
        assertBadAssertions([
            function () { test.assertUndefined(null); },
            function () { test.assertUndefined(false); }
        ]);
    },

    testAssertNotUndefined: function () {
        assertGoodAssertions([
            function () { test.assertNotUndefined(null); },
            function () { test.assertNotUndefined(false); }
        ]);
        assertBadAssertion(
            function () { test.assertNotUndefined(undefined); }
        );
    },

    testAssertArraysEqual: function () {
        assertGoodAssertion(function () {
            test.assertArraysEqual([1, 2, 3], [1, '2', 3]);
        });
        assertBadAssertion(function () {
            test.assertArraysEqual([1, 3, 2], [1, 2, 3]);
        });
    },

    testFail: function () {
        assertBadAssertion(function () { test.fail(); });
    },

    testAssertThrows: function () {
        function errorThrower() {
            throw new Error('oops');
        }
        test.assertThrows(errorThrower, 'Error');
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
