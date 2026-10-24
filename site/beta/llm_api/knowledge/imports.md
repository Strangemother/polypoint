# Theatre source metadata and imports

The theatre runner loads JavaScript dependencies from the leading metadata comment:

```javascript
/*
title: My Stage
categories: animation
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
*/
```

Use dependencies actually required by the example and verify paths against deployed `theatre/` examples. Header paths are relative to the theatre example. Consult `theatre/text-simple-example.js` for a working baseline. Missing stage imports cause runtime failures, even when JavaScript syntax is valid.
