'use strict';

var requirejs = require('requirejs')
, assert = require('assert')
;

requirejs.config({
    baseUrl: '.',
    nodeRequire: require
});

describe('Properties', function() {

    var WP
    , A
    ;

    before(function(done) {
        requirejs(['../watchable-properties'], function(wp) {
            WP = wp;
            done();
        });
    });

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