/*
 * Tests sample-lib.js.
 */

test.addTestCase({
    setUp: function () {
        this.log('setting up');
    },
    tearDown: function () {
        this.log('tearing down');
    },
    testFail: function () {
        this.fail('oops');
    },
    testFrobnicateFoo: function () {
        this.assertEqual('baz', frobnicate('bar'));
        this.assertNull(frobnicate(42));
        this.assertEqual(99, frobnicate('quux'));
        this.assertUndefined(frobnicate('blabla'));
    }
});