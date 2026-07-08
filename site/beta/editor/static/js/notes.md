# Editor

The editor is a small wrapper around ace-editor to manipulate a stage and the canvas.



## Render Notes

The canvas dimensions are affected by a div border stroke. Hitting 'run' will measure and lock the canvas size. If a border is applied, this is included within the dimensions, and the canvas size grows by the width of the border.

To correct this, any styling for the cavas is applied to the `.canvas-wrapper`.
