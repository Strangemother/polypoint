# Points and geometry

Load the `head` and `point` bundles and a Stage, or start with `example-point`.
A point has x/y coordinates, radius, and rotation. Rotation is in **degrees**;
`radians` exposes the same orientation in radians.

```javascript
const a = new Point(100, 200, 30, 45);
const b = new Point({x: 300, y: 200, radius: 20, rotation: 0});
const c = new Point([200, 100, 15, 90]);
a.rotation += 10;
b.radians = Math.PI / 2;
```

Useful operations:

| Operation | Behavior |
| --- | --- |
| `p.update({x: 10, color: 'red'})` | Mutates named properties and returns `p` |
| `p.set(x, y, radius, rotation)` | Mutates coordinates; do not chain from its return value |
| `p.copy()` | Returns a new point with x, y, radius, and rotation |
| `p.add(10, 20)` / `p.subtract(q)` | Return new points; do not mutate `p` |
| `p.midpoint(q, 0.5)` / `p.lerp(q, 0.5)` | Return a new interpolated point |
| `p.lookAt(q)` | Changes `p`'s rotation and returns the angle in radians |
| `p.project()` | Returns a new point in the direction of `p.rotation`, at distance `p.radius` |
| `p.distanceTo(q)` | Distance between points; requires `distances.js` (included by `dragging`) |

Do not use `new Point(existingPoint)` as a copy: this implementation can return
the existing point. Use `copy()` instead. Conversely, `p.copy(other)` mutates
`p`; it is not the same operation as `p.copy()`. Use `update` for selective
property changes rather than assuming `set` preserves omitted coordinates.

For rendering use `p.pen`, not an assumed automatic draw. See `drawing` and the
complete `example-pointer-direction`, `example-bisector`, and `example-quantize`
starters.
