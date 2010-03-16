/*
 * Tests sample-lib.js.
 */

// FIXME: test.load is broken - should provide sample-lib.js as launcher arg
test.load('examples/sample-lib.js');

test.addTestCase({
    testFrobnicateExists: function () {
        this.assertNotUndefined(frobnicate);
    },
    testBar: function () {
        this.assertIdentical('baz', frobnicate('bar'));
    }
});