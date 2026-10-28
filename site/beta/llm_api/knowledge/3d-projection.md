# Pseudo-3D projection

Keep geometry in a shared world coordinate system `(x, y, z)`. Transform it into
camera space, apply a consistent projection, and map it to the viewport. Project
line endpoints, orbit samples, objects, and world-space labels through the same
camera function. Draw fixed HUD elements in screen space after restoring any
world transform.

For a tilted orbit, sample the orbit in its 3D plane, project each sample, and
join them; a screen-space ellipse will not follow camera orbit. Handle points
near or behind the camera's projection plane: avoid dividing by zero and clip
segments crossing the near plane rather than projecting invalid coordinates.
For filled or overlapping objects, choose and verify a depth-ordering or
occlusion strategy; projection alone does not provide one.

Fetch `example-projection` for complete code using the library's rotation and
perspective helpers, including the needed imports. It is a demonstration, not a
general-purpose clipping or depth-buffer implementation, and its frame-based
motion may need elapsed-time updates for consistent speed.
