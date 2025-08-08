# Parallel imports and live composition

Polypoint ships with a tiny parallel loader and a “head” that lets you compose features into classes at runtime. This guide covers how to load assets in parallel, how composition affects both uninstantiated and already-instantiated classes, why super isn’t available through this composition layer, and patterns to overcome that limitation. It also points to complementary utilities from glucose.js.

## Overview

- Loader: Based on l.js, supports alias maps and parallel loads. See `point_src/core/loader.js` and the alias map in `point_src/files.js`.
- Composition: The runtime “head” (`point_src/core/head.js`) exposes install and mixin utilities to augment classes after they load.
- Instances update live: Because mixins define properties on prototypes, existing instances gain new methods/getters without re-instantiation. For per-instance state, use deferred/lazy props.
- No super across mixins: Because composition uses defineProperties on the prototype, there’s no classical inheritance chain between mixins. Use explicit wrapping or composition helpers instead.

## Quick start: parallel loading

1) Build the alias map (or reuse `polypointFileAssets`):

- `point_src/files.js` exports `polypointFileAssets(root)` that returns a map from logical names to URLs/arrays.

2) Register aliases and load in parallel:

- Add aliases once: `ljs.addAliases(polypointFileAssets('../point_src/'))`
- Load batches in parallel using arrays; chain batches via callbacks.

Example (trimmed from `site/beta/editor/static/js/editor/loader.js`):

- Register core assets, then load the “head”, then load fundamentals. All entries within an array load in parallel; sequential batches are chained by the callback.

3) Polypoint’s convenience wrapper:

- `Polypoint.head.load(name, cb)` delegates to `ljs.load(name, cb)` so you can keep load logic in one place.

Notes about the loader:

- Hash fragments set element IDs and can specify CDN fallbacks. The loader de-duplicates loads and handles CSS vs JS automatically.
- Parallelization happens within a single load array; subsequent load calls run when the previous call’s callback fires.

## The composition API (head)

The head manages late-binding of features to classes. Key methods are exposed on `Polypoint.head` (see `point_src/core/head.js`).

- install(Ctor[, name])
  - Registers a constructor by name so later mixins can find it.
  - Modules typically call `Polypoint.head.install(MyClass)` when they load.

- mixin('ClassName', descriptors)
  - Uses `Object.defineProperties` to add properties/methods to the class prototype. Existing and future instances see the change immediately.

- static('ClassName', descriptors) and staticFunctions('ClassName', { fn() {} })
  - Adds static properties/methods to the constructor itself.

- lazyProp('ClassName', { prop() { ... } })
  - Shorthand for defining getters. Good for on-demand computation with per-instance caching that you manage yourself (e.g. via `this._prop`).

- deferredProp('ClassName', function prop() { ... })
  - Per-instance, one-time creator. The getter runs once per instance, stores to `this._prop`, and returns it thereafter. Ideal for adding state to existing instances without touching the constructor.

- lazierProp('ClassName', function prop() { ... })
  - Like deferredProp but the created value is a singleton attached to the library scope, not the instance. Useful for global, on-demand tools or managers.

### How composition affects classes and instances

- Before instantiation (classes not yet new’ed):
  - When you mixin methods/getters, all future instances will include them because they’re defined on the prototype.
  - If you need per-instance state, prefer `deferredProp` so the state is created on first access.

- After instantiation (objects already created):
  - Prototype-level mixins appear immediately on existing instances. Methods, getters, and setters “just work” because the prototype changed.
  - If the new feature relies on constructor-initialized state, use `deferredProp` (per-instance) or a lazy getter that initializes `this._prop` on first access. Avoid assuming constructor-time work has already happened.

Examples pulled from the codebase:

- Install a class when it loads (e.g. `point_src/text/fps.js`): `Polypoint.head.install(FPS)`
- Add a per-instance tool later (deferred, on-demand):
  - `Polypoint.head.deferredProp('Stage', function fps() { return new FPS(this) })`
- Mixin methods after the fact: `Polypoint.head.installFunctions('Point', { distanceTo(other) { /* ... */ } })`

## Why super doesn’t work here

The head’s mixin mechanism is not classical inheritance. It adds/overwrites properties on an existing prototype. There’s no intermediate subclass created and thus no method resolution order to support `super.method(...)`. Overwriting a method replaces it outright.

### Practical patterns to emulate super

Pick one based on your needs:

- Manual wrapping (capture and call the previous implementation):
  - Read the original method, then install a wrapper that calls it. Keep your own reference (or store under a Symbol) before mixing in the new method.

- Namespaced layering:
  - Publish the new behavior under a different name (e.g. `drawWithFPS`) and have callers opt-in explicitly, or delegate from the original method to the namespaced one.

- Deferred composition instead of override:
  - Prefer `deferredProp`/`lazyProp` to attach helpers and call them from existing methods rather than overriding those methods.

- Functional mixins (class decorators):
  - If you control the class definition time, create mixins that return subclasses (e.g. `const WithFoo = Base => class extends Base { /* ... */ }`). This yields a real `super` chain. In Polypoint you can expose such decorated classes as new installs (e.g. `Polypoint.head.install(Decorated)`) rather than patching prototypes in-place. Use this when you truly need inheritance semantics.

Tip: When wrapping, prefer Symbols to store the prior method so you don’t collide with later mixins.

## Using glucose.js alongside Polypoint

Glucose.js provides small, focused utilities for function and object composition. While Polypoint’s head handles runtime property definition, glucose-style helpers are handy for:

- Building before/after/around wrappers for methods in a predictable order.
- Composing multiple small functions into a single behavior without relying on inheritance.
- Defining properties with immutable or explicit descriptors, complementing `Object.defineProperties` usage.

Pattern fit:

- Use Polypoint’s `install`, `mixin`, and `deferredProp` to bind features to classes and instances at runtime.
- Use glucose composition helpers to orchestrate how multiple behaviors combine inside a single method without `super`, e.g. creating wrappers and pipelines that call the previous step explicitly.

Repository: https://github.com/Strangemother/glucose.js

## End-to-end example

Goal: Load text tools, add an FPS overlay to any Stage, and make it available to existing stages without touching constructors.

- Parallel-load text assets:
  - `ljs.addAliases(polypointFileAssets('../point_src/'))`
  - `ljs.load(['head', 'fps'], onReady)`

- When ready, install a per-instance deferred tool on Stage:
  - `Polypoint.head.deferredProp('Stage', function fps() { return new FPS(this) })`

- Use in code (works for new and existing Stage instances):
  - `stage.fps.text = '60 fps'`
  - `stage.fps.draw()`

This approach guarantees:

- Assets are fetched in parallel and de-duplicated.
- Existing Stage instances gain `fps` immediately because it’s a prototype getter, and the instance state (the FPS object) is created on first access.
- No reliance on `super` is required.

## Troubleshooting and tips

- “Property not found” when mixing in: Ensure the class was installed (`Polypoint.head.install(MyClass)`) before the mixin runs, or let the head queue the mixin by name—the head will apply queued mixins when the class appears.
- Existing instances missing state: Prefer `deferredProp` or a lazy getter that initializes `this._something` when accessed.
- Ordering multiple mixins: Since there is no MRO, be explicit. If two mixins target the same method name, the last one wins. Use wrapping and Symbols to preserve and chain prior behavior deterministically.
- Loader alias hygiene: Keep alias names stable (see `point_src/files.js`). Within one `.load([...])`, files fetch in parallel; chain separate groups with callbacks.

---

See also:

- `point_src/core/loader.js` — the parallel loader
- `point_src/files.js` — alias map for assets
- `point_src/core/head.js` — composition API
- `point_src/text/fps.js` — real-world install/deferred example
