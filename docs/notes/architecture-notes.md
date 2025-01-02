# Architecture Notes

Some notes to help me decide on the best format for functionality


## `draw` vs `step` vs `render`

I choice to avoid a `render` method to emphasize a more adaptable, lower-level approach. This approach keeps it open for the end-user to integrate their own render method.

For all items with _drawing features_, we maintain a `step` for integral changes, and a `draw` for full _pen_ work.

Notably at the root of a `Point`, the `draw` object provides many methods. This is coupled with the `pen` object to provide the two scoped integrations.
This leads to a discontinuity in the naming convention, as the `draw` _method_ is less complex items is ambiguous.

---

Therefore I'm proposing the following:

+ `step`: for integral updates, such as the motor for gears.
+ `update`: as a method for entities with full changes, and called when required.
+ `render`: a method combining draw and pen on a context across many sub items - such as a Ribbon

---

## Step

The step method should be purely logical, a avoid performing context drawing when required. A step can be called to update a point values, such as rotations and positions.

In the future we may move the _step_ method off the primary loop (e.g. in a thread).


## draw

A `draw` performs context updates for a frame (noting _immediate mode_ drawing). This performs the context update actions (such as `ctx.moveTo`), but attempts to avoid colouring, _strokes_ or other final visuals.

On a `Point` (and potentially other complex drawable items), the `draw` is an object with many methods. In primary cases, the `draw` is followed by a `pen` method call to render graphics.


## render

Reserved for _end user products_ a `render` method is more formal, utilising many aspects of the reference object (self) to perform many draw and pen actions, with conditions.

A `Point`, `Stage`, or generally most components supplied with the Polypoint library _don't_ have a render method, allowing a developer to write their own where required.

