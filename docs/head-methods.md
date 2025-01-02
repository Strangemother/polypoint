# Polypoint _head_

The _head_ is an object within the primary `Polypoint` collection, with method for loading functionality into the collection.

## Install

Write a class and install it for storage and late mixin detection:

```js
class Automouse {}

Polypoint.head.install(AutoMouse)
```

## Static

Apply a static property:

```js
/*
Install the `Point.mouse` static method.
*/
const autoMouse = (new AutoMouse(Point))
Polypoint.head.static('Point', {
    mouse: {
        value: autoMouse
        // , writable: true
        // , enumerable: false
        // , configurable: true
    }
})
```


## installFunctions

Install methods directly to an installed class:

```js
Polypoint.head.installFunctions('Point', {
    /* Track another point using IK - this point follows the _other_ at a
    set distance. */
    track(other, settings) {
        // return followPoint(other, this, settings)
        return constraints.distance(other, this, settings)
    }

    /* Track another point using constraints. This point follows the other
    point at a distance or less. */
    , leash(other, settings) {
        return constraints.within(other, this, settings)
    }

    /* Ensure this point does not overlap the _other_ point. If an overlap
    occurs, this point is moved. Fundamentally this is the antethsis of leash().*/
    , avoid(other, settings) {
        return constraints.inverse(other, this, settings)
    }
})
```

## lazierProp

Apply a _lazy call_ to execute first time, returning a prepared object:

Importantly, this is a singleton - all instances of the target (e.g. `Stage`) maintain the same object instance. Consider a `deferredProp` for unqiue calls per instance object:

```js
Polypoint.head.lazierProp('Stage', function dragging(){
    console.log('Returning new lazyProp "Dragging"')
    let dr = new Dragging(this)
    dr.initDragging();

    return dr
});
```

## deferredProp

Install a method to a target for a lazy call to a reference object. This is unique per instance:

```js

class PointJiggler {
    wiggle() {}
}

Polypoint.head.deferredProp('Point',
    function jiggler() {
        return new PointJiggler(this)
    }
);

p1 = (new Point()).jigger.wiggle()
```

## Mixin


Install properties onto an incoming unit

```js
Polypoint.mixin('Point', {

    _draggable: {
        value: true,
        writable: true
    }

    , draggable: {
        get() {
            return this._draggable
        }
    }
})

// example.
this.center.draggable == true
this.center._draggable = false
this.center.draggable == false
```
