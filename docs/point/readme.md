> The entire library is focused upon the single 2D Point.

## Getting Started

A `Point` accepts many properties, or an object.

<style>

    .toggle-hidden {
        display: none;
    }

    a.toggle-link {
        text-decoration: none;
    }

    a.toggle-link.toggle-selected {
        text-decoration: underline;
    }
</style>


<div>

<div class="tabs">
    <a data-toggle-group="types"
        class="toggle-selected"
        data-target='arguments'><i>arguments</i></a>
    <a data-toggle-group="types"
        data-target='array'>Array</a>
    <a data-toggle-group="types"
        data-target='object'>Object</a>
    <a data-toggle-group="types"
        data-target='direct'>Direct</a>
</div>
<div class="tab-panels">
<div data-name='arguments'>

Default properties:

```js
// accepts: (x, y, radius, rotation)
new Point(100, 200, 20, 90)
```
</div>
<div data-name='array'>

Or array of the same four attributes

```js
// accepts: (x, y, radius, rotation)
new Point([100, 200, 20, 90])
```
</div>
<div data-name='object'>

The same properties may be applied through an object:

```js
new Point({
    x: 100
    , y: 200
    , radius: 20
    , rotation: 90
})
```
</div>

<div data-name='direct'>

Anything can be applied to the point instance directly:

```js
let point = new Point

point.x = 100
point.y = 200
point.radius = 20
point.rotation = 90
```
</div>

</div>
</div>

<script src="/static/js/toggle-links.js"></script>

