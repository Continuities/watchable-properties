# watchable-properties
An AMD module that creates encapsulated, watchable properties on an object.

This is an improvement over a standard event manager when events are often tied to short-lived object instances. Keeping handler information within the related object allows it to be garbage collected when the related object is garbage collected.

### Usage
Call createOn() to create watchable properties on an object.
Watchable properties can be set and retrieved with setOn() and getFrom().

Set watchers on an object's property with watchOn(). Any changes to the
specified property on the specified object will notify the watcher.

Set watchers on a constructor with watchOnConstructor(). Any changes to
watchable objects created from that constructor will notify the watcher.

### Examples
Initialize watchable-properties on A, set and access a property:

    var WP = require('watchable-properties');
    var A = WP.createOn({});
    WP.setOn(A, 'x', 'Hello World!');
    console.log(WP.getFrom(A, 'x'); // Hello World!

Watch for a change in a property:

    var WP = require('watchable-properties');
    var A = WP.createOn({});
    WP.watchOn(A, 'x', function() { console.log('x changed!'); });
    WP.setOn(A, 'x', 'Cool new thing!'); // x changed!

Watch for a change in a property across all instances of a constructor:

    var WP = require('watchable-properties');
    var A = WP.createOn(function() {});
    var a = WP.createOn(new A());
    WP.watchOnConstructor(A, 'x', function() { console.log('x changed!'); });
    WP.setOn(a, 'x', 'Cool new thing!'); // x changed!
