# Loading Files and Assets

Polypoint is specifically designed to be a _pluggable_ playground. When importing assets they may include _late_ upgrades to existing objects. For example if you're using a _Point_ and later import _distance_ features, existing `Point` instances gain the new functions:

```js
let p = new Point(100, 100)
let other = new Point(200, 200)

p.distanceTo // Does not exist

Polypoint.head.load('distances') // Loads all distance assets

p.distanceTo(other) // exists
Polypoint.Distances // Also exists
```

## Loading Scripts

Polypoint is design to be cut into slices. Import using the dynamic importer ot standard script imports.

```js
Polypoint.head.load('myfile.js')
```

Is the same as:

```jinja
<script src="myfile.js"></script>
```

### Live Loading

Any file can be imported within a server environment, or running as a file. For example the following example will function from `https://example.com`, `http://localhost/index.html`, and `file://my/file/path.html` without change.

Here we also run the files from a local directory. Applying the `srcPath` to the config allows Polypoint to `load` the  files

```jinja
<script src="../point_src/files.js"></script>          <!-- returns polypointFileAssets() -->
<script src="../point_src/core/loader.js"></script>    <!-- Live loader tools -->
<script src="../point_src/core/head.js"></script>      <!-- The library primary head -->

<script>
    Polypoint.head.configure({
        srcPath: '../point_src/'
        , load: ['point',
                 'other']
        , files: polypointFileAssets
        , onLoad() {
            console.log('Loaded')
            Polypoint.head.load("../point_src/theatre/earth-sun.js", ()=>{
                console.log('theatre loaded.')
            })
        }
    })
</script>

<script src="../point_src/functions/clamp.js"></script>  <!-- An example additional file -->
```

This will load the assets in `load`. We use a callback for the _theatre_ file because it required the `Stage` before load.

We also see standard script imports work as expected. The `functions/clamp.js` could be applied to the `Polypoint.head.load()` list, but here we're just mixing-it-up for funs.


### Script Loading

Standard _script_ imports will work just fine for all Polypoint assets. The "Live Loading" example can be done without the dynamic installer:

```jinja
<!-- no `files` or `loader` script required. -->

<script src="../point_src/core/head.js"></script>
<script src="../point_src/pointpen.js"></script>
<script src="../point_src/pointdraw.js"></script>
<script src="../point_src/stroke.js"></script>

<script src="../point_src/point-content.js"></script>

<script src="../point_src/pointlist.js"></script>
<script src="../point_src/point.js"></script>

<script src="../point_src/events.js"></script>
<script src="../point_src/automouse.js"></script>
<script src="../point_src/distances.js"></script>
<script src="../point_src/bisector.js"></script>
<script src="../point_src/dragging.js"></script>
<script src="../point_src/functions/clamp.js"></script>

<script src="../point_src/stage.js"></script>

<!-- Our theatre script -->
<script src="../point_src/theatre/earth-sun.js"></script>
```

### Compiled

> In the future Polypoint will be available as single-file imports

Polypoint is compiler compatible. It will concat and uglify without issue. As all assets are standard classes and object calls, the definition merge stage will work as expected when flattened into one file.


### Choosing

This was initially designed for the Polypoint editor, to hot-plugin components as required. But it can quickly reduce code when creating quick file scripts.

+ You can mix-and-match `load` and `<script>` as required. Importantly we should account for the dependency chain, e.g. the `FPS` class requires the `Text` class.
+ Dynamic loading has a time-penalty of _~30 milliseconds_! Regardless of local caching, many script imports verses the loading script run at roughly the same speed.
    + For Polypoint we're generally aiming for less than a human _blink_ for ready-time. So anything under 150ms is acceptable.
    + The load time will be lower for compiled deployments


## Why No ES6 modules?

Modern ES6 imports are great for a static method resolution order, and compilation. However when poking in a playground they can be limiting:

+ Imports require `import`: `import` does not work in the console and other minor-cases.
+ A `module` is flagged through the view, and also `export` in the importing entity. Which enforces the fact an importing file is `import` and `module` specific

To circumvent these limitations for now, Polypoint adopts and internal `require`-like import method using `l.js` (ljs) of which allows:

+ `<script>` imports for old school
+ A lib `load` that works in the browser
+ File concat through a _merge_ rather than a more complex es6 compiler

With the internal-import format we gain ability to generate ES6 modules through a simple concat method:

1. collect target, e.g. `dragging.js`
2. collect ES6 concat target e.g `dragging.esm-part.js`
3. merge files as `dragging.esm.js`

The `es6-part.js` contains exports for the target file:

```js
export {Dragging}
```


