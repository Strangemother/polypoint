# HTML Include

Polypoint should come with a web component, to easily run polypoint hoisted canvas layers. 
This may be utilised though a range of includsion methods

Theatre load:

```html 
<polypoint-canvas 
    theatre="my/theatre-file.js"
    width="800" height="600"></polypoint-canvas>
```

With inline code: 


```html 
    <polypoint-canvas>
        context.beginPath();
        context.arc(50, 50, 40, 0, 2 * Math.PI);
        context.stroke();
    </polypoint-canvas>
```

    On the Django site, load the component prerequisites before the element:

    ```html
    <script src="/editor/point_src/core/loader.js"></script>
    <script src="/editor/point_src/files.js"></script>
    <script src="/editor/point_src/core/polypoint-canvas.js"></script>
    <polypoint-canvas
        theatre="/examples/scripts+theatre/pseudo3D-wirefame-cube.js/"
        width="300" height="300"
        role="img" aria-label="Animated rotating wireframe cube">
    </polypoint-canvas>
    ```

    The `scripts+theatre` endpoint includes the theatre's dependencies. The component
    adds `?close_scope=1` when loading it. Embedded theatres must call
    `MainStage.announce()` so the component can start the stage on its shadow canvas,
    rather than calling `MainStage.go()` with the standalone `playspace` ID. The
    wireframe cube checks this parameter to preserve its standalone behavior.

With script tag:

```html 
    <polypoint-canvas>
        <script type="javascript">
            context.beginPath();
            context.arc(50, 50, 40, 0, 2 * Math.PI);
            context.stroke();
        </script>
    </polypoint-canvas>
```
