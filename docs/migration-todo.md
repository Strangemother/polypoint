# Migration TODO: Legacy API → Modern API

This document lists all files that currently use the legacy `Polypoint.head.*` API and should be migrated to the modern `Polypoint.extend.*` API.

## Migration Guide

**Old API → New API:**

- `Polypoint.head.deferredProp()` → `Polypoint.extend.prop()`
- `Polypoint.head.lazierProp()` → `Polypoint.extend.singleton()`
- `Polypoint.head.lazyProp()` → `Polypoint.extend.getter()`
- `Polypoint.head.installFunctions()` → `Polypoint.extend.functions()`
- `Polypoint.head.mixin()` → `Polypoint.extend.mixin()`
- `Polypoint.head.static()` → `Polypoint.extend.static()`
- `Polypoint.head.install()` → **Keep as is** (no change needed)

---

## Files Using `Polypoint.head.install()`

These files use `.install()` which is correct - **no changes needed**:

- `point_src/table.js` (2 uses)
- `point_src/pointlistgradient.js`
- `point_src/pointlistpen.js`
- `point_src/automouse.js`
- `point_src/compass.js`
- `point_src/point.js`
- `point_src/text/fps.js`
- `point_src/screenshot-v1.js`
- `point_src/random.js`
- `point_src/mirror.js`
- `point_src/events.js`
- `point_src/pointcast.js`
- `point_src/dragging.js`
- `point_src/stroke.js`
- `point_src/screenshot.js`
- `point_src/pointlistdraw.js`
- `point_src/keyboard.js`
- `point_src/pointlistgenerator.js`
- `point_src/pointlist.js`
- `point_src/pointpen.js`
- `point_src/iter/lerp.js`
- `point_src/curve-extras.js` (2 uses)
- `point_src/stage.js`
- `point_src/timeit.js`
- `point_src/pointdraw.js`

---

## Files Using `Polypoint.head.deferredProp()` → `extend.prop()`

**Total: 22 files**

1. `point_src/intersections.js`
2. `point_src/tethers.js`
3. `point_src/arc.js`
4. `point_src/table.js`
5. `point_src/stagepen.js`
6. `point_src/jiggle.js`
7. `point_src/compass.js`
8. `point_src/tethers-vec.js`
9. `point_src/text/beta.js`
10. `point_src/xybind.js`
11. `point_src/constrain-distance.js`
12. `point_src/screenwrap.js`
13. `point_src/rotate.js`
14. `point_src/functions/within.js`
15. `point_src/functions/springs.js`
16. `point_src/relative.js`
17. `point_src/stage-clock.js` (2 uses)
18. `point_src/windings.js`
19. `point_src/offscreen.js`
20. `point_src/stroke.js`
21. `point_src/iter/lerp.js`
22. `point_src/velocity.js`

---

## Files Using `Polypoint.head.lazierProp()` → `extend.singleton()`

**Total: 10 files**

1. `point_src/text/styler.js` (2 uses - Stage and StagePen)
2. `point_src/text/fps.js`
3. `point_src/xybind.js`
4. `point_src/screenshot-v1.js`
5. `point_src/events.js`
6. `point_src/pointcast.js`
7. `point_src/dragging.js` (2 uses - cursor and dragging)
8. `point_src/screenshot.js`
9. `point_src/keyboard.js`
10. `point_src/capture/encoder.js`

---

## Files Using `Polypoint.head.lazyProp()` → `extend.getter()`

**Total: 4 files**

1. `point_src/functions/springs.js`
2. `point_src/tangents.js`
3. `point_src/pointpen.js` (3 uses)
4. `point_src/pointdraw.js`

---

## Files Using `Polypoint.head.installFunctions()` → `extend.functions()`

**Total: 10 files**

1. `point_src/json.js` (2 uses - Point and PointList)
2. `point_src/curve-knife.js`
3. `point_src/xybind.js`
4. `point_src/constrain-distance.js`
5. `point_src/split.js` (3 uses - Point, BezierCurve, Line)
6. `point_src/touching.js` (2 uses - Point and PointList)
7. `point_src/stage-resize.js`

---

## Files Using `Polypoint.head.mixin()` → `extend.mixin()`

**Total: 4 files**

1. `point_src/point.js`
2. `point_src/dragging.js`
3. `point_src/distances.js`
4. `point_src/velocity.js`

---

## Files Using `Polypoint.head.static()` → `extend.static()`

**Total: 1 file**

1. `point_src/automouse.js`

---

## Files Using Legacy `Polypoint.*` (without `.head`) → Need Update

**Total: 2 files**

These use the deprecated root-level API and should be updated to `Polypoint.extend.*`:

1. `point_src/area.js` - uses `Polypoint.installFunctions()`
2. `point_src/dragging.js` - uses `Polypoint.mixin()`

---

## Summary Statistics

| Method | Files to Update | Total Usages |
|--------|----------------|--------------|
| `deferredProp` → `prop` | 22 | ~23 |
| `lazierProp` → `singleton` | 10 | ~13 |
| `lazyProp` → `getter` | 4 | ~6 |
| `installFunctions` → `functions` | 10 | ~11 |
| `mixin` → `mixin` | 4 | ~4 |
| `static` → `static` | 1 | 1 |
| Legacy root API | 2 | 2 |
| **Total** | **~50 files** | **~60 usages** |

---

## Priority Order

1. **High Priority** - Files with multiple legacy usages:
   - `point_src/dragging.js` (4 usages)
   - `point_src/pointpen.js` (3 usages)
   - `point_src/split.js` (3 usages)
   - `point_src/xybind.js` (3 usages)

2. **Medium Priority** - Core functionality files:
   - `point_src/point.js`
   - `point_src/stage.js`
   - `point_src/pointlist.js`

3. **Low Priority** - Addon/extension files (can be updated gradually)

---

## Notes

- Files in `point_src/core/head.js` contain documentation examples - these are intentionally showing both old and new APIs
- The `install()` method has no new alternative - it remains `Polypoint.head.install()`
- Some files may have commented-out legacy code that doesn't need updating

---

## Generated: 2025-11-02

This list was generated by searching for legacy API usage patterns across the `point_src/` directory.
