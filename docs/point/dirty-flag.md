title: dirty flag
type: attribute
returns: Boolean
---

The _dirty_ flag exists on all Points as a natural attribute. If the core attributes change: `x` `y` `radius`  `rotation`, the point is _dirty_ until tested.

This allows you to actively track a Point without special wiring

```js
p = new Point()
p.dirty
// true 
``` 

> Be aware; A new point is dirty by default. 

Importantly, this is a gaurded attribute, restricting you from manually switching the boolean:

```js
p = new Point()
p.dirty 
// true 

p.dirty = false // Attempt a manual flag.

// Didn't work.
p.dirty  
// true 
``` 

## `wasDirty` 

A common pattern is to test if the target point has changed and react to it. The convenient `Point.wasDirty` allows you to test for a change, and signal the flag was seen. 

```js
p = new Point()
p.dirty == true  // Expected

p.wasDirty
// true 

/* Any subsequent calls yield false */
p.wasDirty
// false

p.dirty
// false
```


This provides a nice feature where we can test for change to save render cycles or provide easy double-binding:

```js
/* If the control point was manipulated, edit the main point. */
if(other.wasDirty) {
    point.lookAt(other)
    point.radius = point.distanceTo(other)
}

/* If the point was altered, edit the control point. */
if(point.wasDirty) {
    other.copy(point.getTip()) // grab the new tip position 
}
```

Because the flag `wasDirty` is only true if the point `dirty=true`, when the _if statement_ is called, and the `dirty` is set to false. 


## Fields

The dirty-flag provides three attributes:


| Attribute | Description |
| --- | --- |
| `dirty` | always returns the current state of the point as a boolean. |
| `wasDirty` | returns a boolean matching the `dirty` flag, and always sets `dirty=false` |
| `_dirty` | the Point internal true state, typically matching `dirty`. This can be manipulated manually |
| --- | --- |


### Notes

#### A new point is always dirty.

This ensures any logic dependant upon the state of a point will react at first draw.

#### wasDirty works once

The `Point.wasDirty` flag is safe _once_ for the first call. Therefore subsequent calls immediately after this call will return `false`. 

A nice solution is to use `dirty` until your last check

```js

if(point.dirty) {
    // ...
}


if(point.dirty) {
    // ...
}

if(point.wasDirty) {
    // ...
}
// Was dirty; Now is not dirty.

// WON'T WORK; Dirty is now false;
if(point.dirty) {
    // ...
}
```

#### Recursive error for double-bound objects

Force the dirty state of a point to disable recursive dependencies:

```js
point._dirty = false        // Force dirty off.
```

You may find where two points depend upon each other, they collide during tests:

```js
if(other.wasDirty) {    
    point.radius = point.distanceTo(other) // edit A 
    // point.dirty == true 
}

if(point.wasDirty) {
    // point.false == true 
    other.copy(point.getTip()) // Edit B
    // other.dirty == true 
}
```

This logic will always call both statements as the last action is `other.dirty == true`, and cause tracking glitches.

To manually fix this, we can use the internal flag to turn off the dirty:

```js
if(other.wasDirty) {    
    point.radius = point.distanceTo(other) // edit A 
    // point.dirty == true 
}

if(point.wasDirty) {
    // point.false == true 
    other.copy(point.getTip()) 
    other._dirty = false        // Force dirty off.
}
```

Therefore the `other.wasDirty` will only flag true if the _other_ point was manipulated elsewhere.



## Example

Here's an example of a tip _control point_ tracking it's primary point.

```js
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.cp = new Point(this.point.getTip())
        this.cp._dirty = false;
        this.dragging.add(this.point, this.cp)
    }

    draw(ctx){
        this.clear(ctx)

        /* If the control point was manipulated, edit the main point. */
        if(this.cp.wasDirty) {
            this.point.lookAt(this.cp)
            this.point.radius = this.point.distanceTo(this.cp)
        }

        /* If the point was altered, edit the control point. */
        if(this.point.wasDirty) {
            this.cp.copy(this.point.getTip())
            this.cp._dirty = false;
        }

        this.point.pen.indicator(ctx);
        this.cp.pen.indicator(ctx);
    }
}

stage = MainStage.go(/*{ loop: true }*/)
```
