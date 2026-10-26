# Animation and input

`draw(ctx)` runs repeatedly by default, but the frame rate is not guaranteed.
For movement in units per second, measure elapsed time with `performance.now()`,
divide milliseconds by 1000, and clamp unusually large deltas after a suspended
tab. The starter in `imports` shows this pattern. Fixed increments per draw
depend on frame rate. Separate updates from rendering when a scene grows.

Register input handlers once, not in `draw`; see `interaction` and the complete
`example-click` and `example-line` starters. The `example-wave` and
`example-motion` starters illustrate animation but use fixed per-frame
increments; replace those increments with time-based updates when speed matters.

Apply camera orbit changes incrementally so manual input composes with automatic
rotation. Verify input, movement speed, layering and occlusion in a browser:
static validation cannot establish visual correctness.
