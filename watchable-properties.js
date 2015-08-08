/**
 *    Watchable Properties
 *    Michael Townsend, 2015
 * 
 *    Creates encapsulated, watchable properties on an object.
 *    This is where I should document how to use it.    
 *
 *    This Source Code Form is subject to the terms of the Mozilla Public
 *    License, v. 2.0. If a copy of the MPL was not distributed with this
 *    file, You can obtain one at http://mozilla.org/MPL/2.0/.
 **/
define(function() {

    function _createWatchableProperties(targetObject) {
        var watchableProperties = {}
        ,   objectWatchers = {}
        ,   prototypeWatchers = {}
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

            if (targetObject.__proto__.__watchProps) {
                targetObject.__proto__.__watchProps.callPrototypeWatchers({
                    propertyName: propertyName
                    , changedFrom: watchableProperties[propertyName]
                    , changedTo: value
                    , target: targetObject
                });
            }

            watchableProperties[propertyName] = value;
        }

        function __callPrototypeWatchers(opts) {
            var watchers = prototypeWatchers[propertyName];

            watchers && watchers.forEach(function(watcher) {
                watcher.call(targetObject, opts);
            });
        }

        function __addObjectWatcher(propertyName, watcherFunction) {
            var watchers = objectWatchers[propertyName] = 
                    objectWatchers[propertyName] || [];

            watcher.push(watcherFunction);
        }

        function __removeObjectWatcher(propertyName, watcherFunction) {
            var watchers = objectWatchers[propertyName] = 
                    objectWatchers[propertyName] || []
            ,   watcherIndex = watcherFunction ? 
                    watchers.indexOf(watcherFunction) : null;

            if (!watcherFunction) {
                delete watchers.propertyName;
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
            , watch: __addObjectWatcher
            , unwatch: __removeObjectWatcher
            , callPrototypeWatchers: __callPrototypeWatchers
        };
    }

    function _watchOnObject(targetObject, propertyName, watcherFunction) {
        if (!targetObject.__watchProps) {
            throw 'Cannot watch ' + propertyName + 
                  ' on unwatchable object: ' + targetObject;
        }

        targetObject.__watchProps.watch(propertyName, watcherFunction);
    }

    function _getProperty(targetObject, propertyName) {
        if (!targetObject.__watchProps) {
            throw 'Cannot get ' + propertyName + 
                  ' from unwatchable object: ' + targetObject;
        }

        return targetObject.__watchProps.get(propertyName);
    }

    function _setProperty(targetObject, propertyName, value) {
        if (!targetObject.__watchProps) {
            throw 'Cannot set ' + propertyName + 
                  ' on unwatchable object: ' + targetObject;
        }

        return targetObject.__watchProps.set(propertyName, value);
    }

    return {
        createOn: _createWatchableProperties
        , watchOn: _watchOnObject
        , getFrom: _getProperty
        , setOn: _setProperty
    };

});