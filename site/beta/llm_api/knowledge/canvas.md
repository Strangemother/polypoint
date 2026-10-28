# Canvas coordinates and drawing

Canvas coordinates normally start at the top left, with x increasing right and y
increasing down. `this.canvas.width` and `.height` are backing-buffer dimensions;
CSS dimensions and device pixel ratio may differ. Check the target viewer and
resize behavior before implementing high-DPI or responsive scaling.

Clear or paint the background before scene elements unless trails are
intentional. Use `ctx.save()` / `ctx.restore()` around transforms, alpha, and
other temporary state. A clear is affected by the current transform, and canvas
paths are not part of the saved state: start independent shapes with
`ctx.beginPath()`.

Choose one coordinate convention: either translate to the center and draw
relative to it, or calculate absolute screen coordinates (for example in a
projection function). Do not do both. Restore the world transform before
drawing screen-fixed HUD text. Do not assume a filled background is visible
if another fill is drawn over it later.
