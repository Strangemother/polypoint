# `PointList.cast` method

Typically we provide many `Point` types to a `PointList`, as the list doesn't accept other types, such as a dictionary.

To save keystrokes we can use the `cast()` function on a `PointList` to convert all items to `Point` types.

Before (No cast):

```js
new PointList(
    new Point({x:100, y:150, radius:50,  name: 'head' })
    , new Point({x:400, y:180, radius:8,  name: 'neck'})
    , new Point({x:100, y:200, radius:10,  name:'shoulders' })
    , new Point({x:100, y:220, radius:8,  name: 'elbow'  })
    , new Point({x:100, y:230, radius:8,  name: 'hand'  })
    , new Point({x:100, y:240, radius:8,  name: 'elbow' })
    , new Point({x:100, y:250, radius:8,  name: 'hand' })
    , new Point({x:100, y:260, radius:15,  name: 'hips' })
    , new Point({x:100, y:310, radius:8,  name: 'leg'  })
    , new Point({x:100, y:320, radius:8,  name: 'foot'})
    , new Point({x:100, y:340, radius:8,  name: 'leg' })
    , new Point({x:400, y:520, radius:8,  name: 'foot'})
)
```


After (with cast):


```js
new PointList(
    {x:100, y:150, radius:50,  name: 'head' }
    , {x:400, y:180, radius:8,  name: 'neck'}
    , {x:100, y:200, radius:10,  name:'shoulders' }
    , {x:100, y:220, radius:8,  name: 'elbow'  }
    , {x:100, y:230, radius:8,  name: 'hand'  }
    , {x:100, y:240, radius:8,  name: 'elbow' }
    , {x:100, y:250, radius:8,  name: 'hand' }
    , {x:100, y:260, radius:15,  name: 'hips' }
    , {x:100, y:310, radius:8,  name: 'leg'  }
    , {x:100, y:320, radius:8,  name: 'foot'}
    , {x:100, y:340, radius:8,  name: 'leg' }
    , {x:400, y:520, radius:8,  name: 'foot'}
).cast()
```
