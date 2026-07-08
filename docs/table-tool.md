# Table Tool

A `Table` is a class to simplify loadouts of _a lot of data_ in dictionary form.

For example, if we a big stack of objects:

```js
const conf = {
    'default': {
        minDistance: 30
        , attractionStrength: 0.004
        , repulsionStrength: 200
        , damping: 0.60
        , minVelocity: 0.1
        , maxVelocity: 5
    }
    , 'alt': {
        minDistance: 90
        , attractionStrength: 0.002
        , repulsionStrength: 100
        , damping: 0.66
        , minVelocity: 0.08
        , maxVelocity: 5
    }
    , 'gas': {
        minDistance: 100
        , attractionStrength: 0.001
        , repulsionStrength: 800
        , damping: 0.974
        , minVelocity: 0.1
        , maxVelocity: 9
        , itercount: 1
    }
    , 'stable': {
        minDistance: 100
        , attractionStrength: 0.001
        , repulsionStrength: 80
        , damping: 0.974
        , minVelocity: 0.01
        , maxVelocity: 9
        , itercount: 1
    }
    , 'blob': {
        minDistance: 90
        , attractionStrength: 0.002
        , repulsionStrength: 100
        , damping: 0.95
        , minVelocity: 0.1
        , maxVelocity: 20
        , itercount: 1
        // , method: 'squareDistance'
        // , method: 'springy'
    }
}
```

We can reduce it to something smaller:

```js
let keys = [
    "minDistance"
    , "attractionStrength"
    , "repulsionStrength"
    , "damping"
    , "minVelocity"
    , "maxVelocity"
    , "itercount"
    , "method"
]

const confTable = new Table(keys, {
      'default': [30,  0.004, 200, 0.60,  0.1,  5]
    , 'alt':     [90,  0.002, 100, 0.66,  0.08, 5]
    , 'gas':     [100, 0.001, 800, 0.974, 0.1,  9,  1]
    , 'stable':  [100, 0.001, 80,  0.974, 0.01, 9,  1]
    , 'blob':    [90,  0.002, 100, 0.95,  0.1,  20, 1, 'springy']
})

// Select an object:
const settings = confTable.get("gas")
settings.minDistance == 100
```

If we supply an array, the keys become _integers_:

```js

const confTable = new Table(keys,[
      [30,  0.004, 200, 0.60,  0.1,  5]
    , [90,  0.002, 100, 0.66,  0.08, 5]
    , [100, 0.001, 800, 0.974, 0.1,  9,  1] // Gas
    , [100, 0.001, 80,  0.974, 0.01, 9,  1]
    , [90,  0.002, 100, 0.95,  0.1,  20, 1, 'springy']
])

const settings = confTable.get(2)
settings.minDistance == 100
```