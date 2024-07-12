# `PointList.setMany`


An example of switching the `rotation` value in all points in a list, selecting
the last row and using `setMany`:

**Example _before_**

```js
pointList.forEach((p,i)=>{
    p.radius = conf.radius
    let isLastColumn = (i+1) % conf.cols == 0;
    let dir = isLastColumn? DOWN_DEG: RIGHT_DEG
    p.rotation =  dir
})
```

## `setMany`

```js

pointList.setMany(conf.radius, 'radius')
pointList.setMany(RIGHT_DEG, 'rotation')
pointList.setMany(false, 'hit')

let gridTools = new GridTools(pointList, 10) // 10 columns wide
let columnPointList = gridTools.getColumn(-1) // get the last column

columnPointList.setMany(DOWN_DEG, 'rotation')
```

## `setDict`

```js
pointList.setData({
    radius: conf.radius
    , rotation: RIGHT_DEG
    , hit: false
})


let gridTools = new GridTools(pointList, 10) // 10 columns wide
let columnPointList = gridTools.getColumn(-1) // get the last column

columnPointList.setMany(DOWN_DEG, 'rotation')
```

