# Installing Addons

Polypoint and all its assets are _pluggable_ through a process of `install` and `mixin` prototype loading. This allows us to _import_ for it to hoist methods on existing assets.

Like this:

```js
// Pretend Polypoint.Stage
class Stage {}

// tell Polypoint this is a mixin thing.
Polypoint.install(Stage)

const stage = new Stage();
/* could also become */
// const stage = new Polypoint.Stage();


// No dragging tools yet
console.log(stage.dragging)
undefined
```

Install something:

```js
// We can install a new function
Polypoint.lazierProp('Stage', function dragging(){
    console.log('new dragging instance')
    let dr = new Dragging(this)
    dr.initDragging();
    return dr
});

console.log(stage.dragging)
// "new dragging instance"
// <Dragging>
```


## Usage

A Polypoint asset should be loaded into the primary object.


### Install

Use `Polypoint.install` to ensure the entity is available for overloading:

```js
// Pretend Polypoint.Stage
class Thing {}

// tell Polypoint this is a mixin thing.
Polypoint.install(Thing)

Polypoint.Thing == Thing
```


### `mixin`

Install properties onto an incoming unit. The target may be any _installed_ asset:

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

this.center.draggable == true
this.center._draggable = false
this.center.draggable == false
```

The mixin exposes the standard `Object.defineProperties`


### `installFunctions`

Assume many functions to install:

```js
Polypoint.installFunctions('Point', {
    track(other, settings) {
        return constraints.distance(other, this, settings)
    }

    , leash(other, settings) {
        return constraints.within(other, this, settings)
    }
});
```

Synonymous to:

```js
Polypoint.mixin('Point', {
    track: {
        value(any=false) {
            // ...
        }
        , writable: true
    }
    , leash: {
        // ...
    }
})
```


### `lazyProp`

Assume many correctly named functions to access values on first call.

```js
Polypoint.lazyProp('Point', {
    pen() {
        let r = this._pen
        if(r == undefined) {
            r = new PointPen(this)
            this._pen = r
        }
        return r
    }
})

stage.center._pen == undefined
stage.center.pen == Pen
stage.center._pen == Pen
```

Synonymous to:

```js
Polypoint.head.mixin('Point', {
    pen: {
        get() {
            let r = this._pen
            if(r == undefined) {
                r = new PointPen(this)
                this._pen = r
            }
            return r
        }
    }
})
```


### `lazierProp`

Using the `lazyProp` for a _first call create_ is very common. Therefore we have a lazier function:

>[TIP]
> Arrow functions may not maintain the correct scope for `this` within the call. Read the "Method Note" for more info

```js
Polypoint.head.lazierProp('Stage',
    function screenshot() {
        return new Screenshot(this)
    }
);
```

This applies the `screenshot()` method to a stage, but will only call once.
Any subsequesnt calls to `stage.screenshot()` will yield the generated object:

```js
const stage = new Stage;
stage._screenshot == undefined
console.log(stage.screenshot)
stage._screenshot == stage.screenshot
```

Synonymous to:

```js
Polypoint.head.lazyProp('Stage', {
    screenshot() {
        let s = this._screenshot;
        if(s) { return s };
        this._screenshot = new Screenshot(this)
        return this._screenshot
    }
})
```

#### Arrow Functions `()=>{}`

The lazy prop is called once, and the result is cached under the `_{name}` of the method.
The scope of the callback (`this`), is the target instance `(new Point)`. The `this` reference for arrow functions is the outer scope.

If the sub entity requires a reference to the owning entity (Such as the `Point.as...` methods need a reference to its `point`), ensure to use the classic function:

In this example the `PointCast` class requires a reference to `this` of type `Point`:


```js
// Without lazy prop:
const point = new Point(100, 200)
point.as = PointerCast(point);
point.as.array()
// [100, 200]
```

With the `lazierProp` example, we ensure a closed scope for this one-time call using `function(){ ... }`:

```js
Polypoint.lazierProp('Point', function(){
    return new PointCast(this)
}, 'as')
```

When using arrow functions `()=>{}` the `this` reference is not the `Point`, but is more likely the `window`

```js
// will not work

// `this` is undefined
Polypoint.lazierProp('Point', ()=>new PointCast, 'as')
// `this` is Window
Polypoint.lazierProp('Point', ()=>{ new PointCast(this)}, 'as')
```

In both cases the `this` reference did not correctly apply the scope as the `Point` instance.