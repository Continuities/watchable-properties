'use strict';

var requirejs = require('requirejs')
, assert = require('assert')
;

requirejs.config({
    baseUrl: '.',
    nodeRequire: require
});

describe('Watchable Properties', function() {

    var WP;
    before(function(done) {
        requirejs(['../watchable-properties'], function(wp) {
            WP = wp;
            done();
        });
    });

    describe('Properties', function() {

        var A;
        beforeEach(function(done) {
            A = {};
            WP.createOn(A);
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
            A = {}, B = {};
            WP.createOn(A);
            WP.createOn(B);
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
});