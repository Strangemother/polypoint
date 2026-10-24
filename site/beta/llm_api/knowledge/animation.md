# Animation and input

Store mutable animation state on the Stage instance. Use elapsed time (or measured frame delta) for consistent movement; clamp unusually large deltas after tab suspension. Input handlers should be added once, not each frame. Apply camera orbit updates incrementally so manual inputs compose with auto-rotation.

A correct animation requires visual inspection. Static checks cannot identify incorrect gait direction, occlusion, layering, or speed at runtime. A minimal theatre may animate a single point before adding geometry.
