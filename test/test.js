'use strict';

var requirejs = require('requirejs')
, assert = require('assert')
;

requirejs.config({
    baseUrl: '..',
    nodeRequire: require
});

describe('Watchable Properties', function() {

    var WP;
    before(function(done) {
        requirejs(['watchable-properties'], function(wp) {
            WP = wp;
            done();
        });
    });

    describe('Initialization', function() {
        var A;
        beforeEach(function(done) {
            A = {};
            done();
        });

        it('should be able to create watch-props on an object', function() {
            WP.createOn(A);
            assert(A.__watchProps);
        });

        it('should throw an exception for double create calls', function() {
            var failed = false;
            WP.createOn(A);
            try {
                WP.createOn(A);
            } catch (e) { failed = true; }

            assert(failed);
        });

        it('should throw an exception when getting on an unwatchable', function() {
            var failed = false;
            try {
                WP.getFrom(A, 'test');
            } catch(e) { failed = true; }

            assert(failed);
        });

        it('should throw an exception when setting on an unwatchable', function() {
            var failed = false;
            try {
                WP.setOn(A, 'test');
            } catch(e) { failed = true; }

            assert(failed);
        });

        it('should throw an exception when watching an unwatchable', function() {
            var failed = false;
            try {
                WP.watchOn(A, 'test', function() {});
            } catch(e) { failed = true; }

            assert(failed);
        });

        it('should throw an exception when watching an unwatchable constructor', function() {
            var failed = false;
            try {
                WP.watchOnConstructor(A, 'test', function() {});
            } catch(e) { failed = true; }

            assert(failed);
        });
    });

    describe('Properties', function() {

        var A;
        beforeEach(function(done) {
            A = WP.createOn({});
            done();
        });

        it('should get and set properly', function() {
            WP.setOn(A, 'test', 'foo');
            assert.equal('foo', WP.getFrom(A, 'test'));
        });

        it('should handle multiple get/sets', function() {
            WP.setOn(A, 'foo', 1);
            WP.setOn(A, 'bar', 2);
            WP.setOn(A, 'baz', 3);
            assert.equal(1, WP.getFrom(A, 'foo'));
            assert.equal(2, WP.getFrom(A, 'bar'));
            assert.equal(3, WP.getFrom(A, 'baz'));
        });

        it('should update values properly', function() {
            WP.setOn(A, 'test', 'foo');
            WP.setOn(A, 'test', 'bar');
            assert.equal('bar', WP.getFrom(A, 'test'));
        });
    });

    describe('Object Watchers', function() {
        var A, B;
        beforeEach(function(done) {
            A = WP.createOn({}), B = WP.createOn({});
            done();
        });

        it('should be possible to add a watcher', function() {
            var seenValue = null;
            WP.watchOn(A, 'test', function(opts) { seenValue = opts.changedTo; });
            WP.setOn(A, 'test', 'foo');
            assert.equal('foo', seenValue);
        });

        it('should be possible to remove a watcher', function() {
            var seenValue = null;
            function watcher(opts) { seenValue = opts.changedTo; }
            WP.watchOn(A, 'test', watcher);
            WP.unwatchOn(A, 'test', watcher);
            WP.setOn(A, 'test', 'foo');
            assert.equal(null, seenValue);
        });

        it('should only notify watchers of the correct properties', function() {
            var seenValue = null;
            WP.watchOn(A, 'test', function(opts) { seenValue = opts.changedTo; });
            WP.setOn(A, 'not test', 'foo');
            assert.equal(null, seenValue);
        });

        it('should only notify watchers of the correct object', function() {
            var seenValue = null;
            WP.watchOn(A, 'test', function(opts) { seenValue = opts.changedTo; });
            WP.setOn(B, 'test', 'foo');
            assert.equal(null, seenValue);
        });

        it('should only remove the specified watcher', function() {
            var seen1 = null, seen2 = null;
            function watcher(opts) { seen1 = opts.changedTo; }
            WP.watchOn(A, 'test', watcher);
            WP.watchOn(A, 'test', function(opts) { seen2 = opts.changedTo; });
            WP.unwatchOn(A, 'test', watcher);
            WP.setOn(A, 'test', 'foo');
            assert.equal(null, seen1);
            assert.equal('foo', seen2);
        });

        it('should be possible to add multiple watchers', function() {
            var seen1 = null, seen2 = null;
            WP.watchOn(A, 'test', function(opts) { seen1 = opts.changedTo; });
            WP.watchOn(A, 'test', function(opts) { seen2 = opts.changedTo; });
            WP.setOn(A, 'test', 'foo');
            assert.equal('foo', seen1);
            assert.equal('foo', seen2);
        });

        it('should be possible to remove all watchers', function() {
            var seenValue = null;
            WP.watchOn(A, 'test', function(opts) { seenValue = opts.changedTo; });
            WP.watchOn(A, 'test', function(opts) { seenValue = opts.changedTo; });
            WP.watchOn(A, 'test', function(opts) { seenValue = opts.changedTo; });
            WP.unwatchOn(A, 'test');
            WP.setOn(A, 'test', 'foo');
            assert.equal(null, seenValue);
        });
    });

    describe("Constructor Watchers", function() {
        var A, a1, a2, a3, B, b1, b2, b3;
        beforeEach(function(done) {
            A = WP.createOn(function() {}); B = WP.createOn(function() {});
            a1 = WP.createOn(new A()); a2 = WP.createOn(new A()); WP.createOn(a3 = new A());
            b1 = WP.createOn(new B()); b2 = WP.createOn(new B()); WP.createOn(b3 = new B());
            done();
        });

        it('should be possible to add a watcher', function() {
            var seen = null;
            WP.watchOnConstructor(A, 'test', function(opts) {
                seen = opts.changedTo;
            });
            WP.setOn(a1, 'test', 'foo');
            assert.equal('foo', seen);
            WP.setOn(a2, 'test', 'bar');
            assert.equal('bar', seen);
        });

        it('should be possible to remove a watcher', function() {
            var seen = null;
            function watcher(opts) { seen = opts.changedTo; }
            WP.watchOnConstructor(A, 'test', watcher);
            WP.unwatchOnConstructor(A, 'test', watcher);
            WP.setOn(a1, 'test', 'foo');
            WP.setOn(a2, 'test', 'foo');
            WP.setOn(a3, 'test', 'foo');
            assert.equal(null, seen);
        });

        it('should only notify watchers of the correct properties', function() {
            var seen = null;
            WP.watchOnConstructor(A, 'test', function(opts) { seen = opts.changedTo; });
            WP.setOn(a1, 'not test', 'foo');
            WP.setOn(a2, 'not test', 'foo');
            WP.setOn(a3, 'not test', 'foo');
            assert.equal(null, seen);
        });

        it('should only notify watchers of the correct constructor', function() {
            var seen = null;
            WP.watchOnConstructor(A, 'test', function(opts) { seen = opts.changedTo; });
            WP.setOn(b1, 'test', 'foo');
            WP.setOn(b2, 'test', 'foo');
            WP.setOn(b3, 'test', 'foo');
            assert.equal(null, seen);
        });

        it('should only remove the specified watcher', function() {
            var seen1 = null, seen2 = null;
            function watcher(opts) { seen1 = opts.changedTo; }
            WP.watchOn(A, 'test', watcher);
            WP.watchOn(A, 'test', function(opts) { seen2 = opts.changedTo; });
            WP.unwatchOn(A, 'test', watcher);
            WP.setOn(A, 'test', 'foo');
            assert.equal(null, seen1);
            assert.equal('foo', seen2);
        });

        it('should be possible to add multiple watchers', function() {
            var seen1 = null, seen2 = null;
            WP.watchOnConstructor(A, 'test', function(opts) { seen1 = opts.changedTo; });
            WP.watchOnConstructor(A, 'test', function(opts) { seen2 = opts.changedTo; });
            WP.setOn(a1, 'test', 'foo');
            assert.equal('foo', seen1);
            assert.equal('foo', seen2);
            WP.setOn(a2, 'test', 'bar');
            assert.equal('bar', seen1);
            assert.equal('bar', seen2);
            WP.setOn(a3, 'test', 'baz');
            assert.equal('baz', seen1);
            assert.equal('baz', seen2);
        });

        it('should be possible to remove all watchers', function() {
            var seen = null;
            WP.watchOnConstructor(A, 'test', function(opts) { seen = opts.changedTo; });
            WP.watchOnConstructor(A, 'test', function(opts) { seen = opts.changedTo; });
            WP.watchOnConstructor(A, 'test', function(opts) { seen = opts.changedTo; });
            WP.unwatchOnConstructor(A, 'test');
            WP.setOn(a1, 'test', 'foo');
            WP.setOn(a2, 'test', 'foo');
            WP.setOn(a3, 'test', 'foo');
            assert.equal(null, seen);
        });
    });
});