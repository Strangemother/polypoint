# Canvas and coordinate rules

Canvas drawings are screen coordinates unless you explicitly transform them. Use `ctx.save()` / `ctx.restore()` around translates, scales, rotates and opacity changes. Clear or fill the background before drawing scene elements; otherwise later fills can obscure the scene. Verify CSS pixels versus backing buffer dimensions for responsive rendering.

For a centered 2D scene, prefer `ctx.translate(width/2,height/2)` and draw relative to that origin. Alternatively, calculate absolute pixel coordinates in the projection function and do not translate again. Never mix the two conventions. Draw HUD text outside world-space transforms when it should stay fixed to the screen.
