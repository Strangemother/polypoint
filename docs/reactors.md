# Reactors

A "Reactor" is typically an object (instance of a class) to handle changes across all its points. A few free reactors exist

## Gravity Reactor

The _gravity_ reactor adds 2D motion in a direction 
Apply many points to the reactor, and step every frame:

```js
    gr = new GravityReactor(gravityPoint, points)
    gr.step()
```

Note: this isn't a _mass_ reactor (where points tend towards each other)

## Velocity Reactor

The velocity addon supplies classes and methods for speed and Vector based motion.

A `Vector` is very similar to a `Point`, but is referenced within a point through
`vx`, `vy`


## Rope Reactor

The _rope_ provides constraints through vertlet chain solutions.