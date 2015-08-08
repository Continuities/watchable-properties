/**
 *  Watchable Properties
 *  Michael Townsend, 2015
 *  Creates encapsulated, watchable properties on an object.
 *    
 *  Usage:
 *  Call createOn() to create watchable properties on an object.
 *  Watchable properties can be set and retrieved with setOn() and getFrom().
 *  
 *  Set watchers on an object's property with watchOn(). Any changes to the
 *  specified property on the specified object will notify the watcher.
 *  
 *  Set watchers on a constructor with watchOnConstructor(). Any changes to
 *  watchable objects created from that constructor will notify the watcher.
 *
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 **/
define(function() {

    'use strict';

    function _createWatchableProperties(targetObject) {
        var watchableProperties = {}
        ,   objectWatchers = {}
        ,   constructorWatchers = {}
        ;

        if (targetObject.__watchProps) {
            throw "Watchable properties already initialized on object: " 
                + targetObject;
        }

        function __get(propertyName) {
            return watchableProperties[propertyName];
        }

        function __set(propertyName, value) {
            var watchers = objectWatchers[propertyName];

            watchers && watchers.forEach(function(watcher) {
                watcher.call(targetObject, { 
                    changedFrom: watchableProperties[propertyName]
                    , changedTo: value
                })
            });

            if (targetObject.constructor.__watchProps) {
                targetObject.constructor.__watchProps.callConstructorWatchers(
                    propertyName,
                    {
                        changedFrom: watchableProperties[propertyName]
                        , changedTo: value
                        , target: targetObject
                    }
                );
            }

            watchableProperties[propertyName] = value;
        }

        function __callConstructorWatchers(propertyName, opts) {
            var watchers = constructorWatchers[propertyName];

            watchers && watchers.forEach(function(watcher) {
                watcher.call(targetObject, opts);
            });
        }

        function __addWatcher(watcherList, propertyName, watcherFunction) {
            var watchers = watcherList[propertyName] = 
                    watcherList[propertyName] || [];

            watchers.push(watcherFunction);
        }

        function __removeWatcher(watcherList, propertyName, watcherFunction) {
            var watchers = watcherList[propertyName] = 
                    watcherList[propertyName] || []
            ,   watcherIndex = watcherFunction ? 
                    watchers.indexOf(watcherFunction) : null;

            if (!watcherFunction) {
                delete watcherList[propertyName];
                return;
            }

            if (watcherIndex < 0) {
                return;
            }

            watchers.splice(watcherIndex, 1);
        }

        targetObject.__watchProps = {
            get: __get
            , set: __set
            , watch: __addWatcher.bind(targetObject, objectWatchers)
            , unwatch: __removeWatcher.bind(targetObject, objectWatchers)
            , watchConstructor: __addWatcher.bind(targetObject, constructorWatchers)
            , unwatchContructor: __removeWatcher.bind(targetObject, constructorWatchers)
            , callConstructorWatchers: __callConstructorWatchers
        };

        return targetObject;
    }

    function _watchOnObject(targetObject, propertyName, watcherFunction) {
        _verifyWatchable(targetObject, 'watch ' + propertyName);
        targetObject.__watchProps.watch(propertyName, watcherFunction);
    }

    function _unwatchOnObject(targetObject, propertyName, watcherFunction) {
        _verifyWatchable(targetObject, 'unwatch ' + propertyName);
        targetObject.__watchProps.unwatch(propertyName, watcherFunction);
    }

    function _watchOnConstructor(targetObject, propertyName, watcherFunction) {
        _verifyWatchable(targetObject, 'watch ' + propertyName);
        targetObject.__watchProps.watchConstructor(propertyName, watcherFunction);
    }

    function _unwatchOnConstructor(targetObject, propertyName, watcherFunction) {
        _verifyWatchable(targetObject, 'unwatch ' + propertyName);
        targetObject.__watchProps.unwatchContructor(propertyName, watcherFunction);
    }

    function _getProperty(targetObject, propertyName) {
        _verifyWatchable(targetObject, 'get ' + propertyName);
        return targetObject.__watchProps.get(propertyName);
    }

    function _setProperty(targetObject, propertyName, value) {
        _verifyWatchable(targetObject, 'set ' + propertyName);
        return targetObject.__watchProps.set(propertyName, value);
    }

    function _verifyWatchable(targetObject, attemptedOperation) {
        if (!targetObject.__watchProps) {
            throw 'Cannot ' + (attemptedOperation || 'do watchable things') +
                  ' on unwatchable object: ' + targetObject;
        }
    }

    return {
        createOn: _createWatchableProperties
        , watchOn: _watchOnObject
        , unwatchOn: _unwatchOnObject
        , watchOnConstructor: _watchOnConstructor
        , unwatchOnConstructor: _unwatchOnConstructor
        , getFrom: _getProperty
        , setOn: _setProperty
    };

});