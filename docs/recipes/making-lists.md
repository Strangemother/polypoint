# Neater Lists

Let's reduce this chunky hunk of code to less:

**Before**

```js
let midline = new Point(400, 400)
this.points = new PointList(
    new Point({x:midline.x, y:150, radius:50, vx: .1, vy: 0, mass: 1, name: 'head' })
    , new Point({x:400, y:180, radius:8, vx: .1, vy: 0, mass: 1, name: 'neck'})
    , new Point({x:midline.x, y:200, radius:10, vx: .1, vy: 0, mass: 1, name:'shoulders' })

    // arm
    , new Point({x:midline.x-20, y:220, radius:8, vx: .1, vy: 0, mass: 1, name: 'elbow'  })
    , new Point({x:midline.x, y:230, radius:8, vx: .1, vy: 0, mass: 1, name: 'hand'  })

    // right arm
    , new Point({x:midline.x+20, y:240, radius:8, vx: .1, vy: 0, mass: 1, name: 'elbow' })
    , new Point({x:midline.x+40, y:250, radius:8, vx: .1, vy: 0, mass: 1, name: 'hand' })

    // ledt leg
    , new Point({x:midline.x-20, y:260, radius:15, vx: .1, vy: 0, mass: 1, name: 'hips' })
    , new Point({x:midline.x-50, y:310, radius:8, vx: .1, vy: 0, mass: 1, name: 'leg'  })

    , new Point({x:midline.x, y:320, radius:8, vx: .1, vy: 0, mass: 1, name: 'foot'})
    , new Point({x:midline.x, y:340, radius:8, vx: .1, vy: 0, mass: 1, name: 'leg' })

    , new Point({x:400, y:520, radius:8, vx: .1, vy: 0, mass: 1, name: 'foot'})
)
```

## `PointList.cast`

To save keystrokes we can use the `cast()` function on a `PointList` to convert all items to `Point` types.

**After** (with cast):

```js
let midline = this.center.copy()
this.points = new PointList(
    {x:midline.x, y:150, radius:50, vx: .1, vy: 0, mass: 1, name: 'head' }
    , {x:400, y:180, radius:8, vx: .1, vy: 0, mass: 1, name: 'neck'}
    , {x:midline.x, y:200, radius:10, vx: .1, vy: 0, mass: 1, name:'shoulders' }

    // arm
    , {x:midline.x-20, y:220, radius:8, vx: .1, vy: 0, mass: 1, name: 'elbow'  }
    , {x:midline.x, y:230, radius:8, vx: .1, vy: 0, mass: 1, name: 'hand'  }

    // right arm
    , {x:midline.x+20, y:240, radius:8, vx: .1, vy: 0, mass: 1, name: 'elbow' }
    , {x:midline.x+40, y:250, radius:8, vx: .1, vy: 0, mass: 1, name: 'hand' }

    // ledt leg
    , {x:midline.x-20, y:260, radius:15, vx: .1, vy: 0, mass: 1, name: 'hips' }
    , {x:midline.x-50, y:310, radius:8, vx: .1, vy: 0, mass: 1, name: 'leg'  }

    , {x:midline.x, y:320, radius:8, vx: .1, vy: 0, mass: 1, name: 'foot'}
    , {x:midline.x, y:340, radius:8, vx: .1, vy: 0, mass: 1, name: 'leg' }

    , {x:400, y:520, radius:8, vx: .1, vy: 0, mass: 1, name: 'foot'}
).cast()

```


## `PointList.update`


Then we havea lot of repeat `vx`, `vy`, `mass`. Luckily the point list has an update function, this updates each point:

```js
let midline = this.center.copy()
this.points = new PointList(
    {x:midline.x, y:150, radius:50, name: 'head' }
    , {x:400, y:180, radius:8, name: 'neck'}
    , {x:midline.x, y:200, radius:10, name:'shoulders' }
    // arm
    , {x:midline.x-20, y:220, radius:8, name: 'elbow'  }
    , {x:midline.x, y:230, radius:8, name: 'hand'  }

    // right arm
    , {x:midline.x+20, y:240, radius:8, name: 'elbow' }
    , {x:midline.x+40, y:250, radius:8, name: 'hand' }

    // ledt leg
    , {x:midline.x-20, y:260, radius:15, name: 'hips' }
    , {x:midline.x-50, y:310, radius:8, name: 'leg'  }

    , {x:midline.x, y:320, radius:8, name: 'foot'}
    , {x:midline.x, y:340, radius:8, name: 'leg' }

    , {x:400, y:520, radius:8, name: 'foot'}
).cast()

this.points.update({
    vx: .1, vy: 0, mass: 1
});
```

That's still a lot of repeat words.

## Custom Point

In this example we'll exxtend the Point, and apply a default `radius` if undefined:

```js

class BodyPoint extends Point {
    created() {
        if(this._opts.radius != undefined) return;
        this.radius = 8
    }
}

let midline = this.center.copy()
    , mx = midline.x
    ;

this.points = new PointList(
      {x: mx, y:150, radius:50, name: 'head' }
    , {x: 400, y:180, name: 'neck'}
    , {x: mx, y:200, radius:10, name:'shoulders' }
    // arm
    , {x: mx-20, y:220, name: 'elbow'  }
    , {x: mx, y:230, name: 'hand'  }

    // right arm
    , {x: mx+20, y:240, name: 'elbow' }
    , {x: mx+40, y:250, name: 'hand' }

    // left leg
    , {x: mx-20, y:260, radius:15, name: 'hips' }
    , {x: mx-50, y:310, name: 'leg'  }

    , {x: mx, y:320, name: 'foot'}
    , {x: mx, y:340, name: 'leg' }

    , {x:400, y:520, name: 'foot'}
).cast(BodyPoint)
```

Better. But it would be nice to reduce further. Unfortunately because we're applying the `name` property to each point, it's not possible to simply convert each point to a _list_ type; because a list type point accepts `[x, y, radius, rotation]`.



```js

points = new PointList(
    // name,          x,     y,   radius
      ['head',        mx,    150, 50]
    , ['neck',        400,   180]
    , ['shoulders',   mx,    200, 10]
    // left arm
    , ['elbow',       mx-20, 220]
    , ['hand' ,       mx,    230]
    // right arm
    , ['elbow',       mx+20, 240]
    , ['hand',        mx+40, 250]
    // --- 
    , ['hips',        mx-20, 260, 15]
    // left leg
    , ['leg' ,        mx-50, 310]
    , ['foot',        mx,    320]
    // right leg
    , ['leg',         mx,    340]
    , ['foot',        400,   520]
).cast(BodyPoint, function(arrItem, type){
    let [name, ...xyr] = arrItem
    let o = (new type(xyr)).update({
                vx: .1, vy: 0, mass: 1, name 
            })
    return o 
});
        
```

This requires a bit more code in the cast function, but saves a lot of repetition in the point list.
