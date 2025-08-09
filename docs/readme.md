title: Documentation
---


> Polypoint.js is a library dedicated to the humble 2D point.

Polypoint aims to provide a straightforward interface for working with 2D points, enabling users to engage in mathematical and creative point drawing without the complexity of traditional drawing libraries. It supports low-level context drawing, allowing users to implement their own drawing logic with ease.


```js
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        const point = this.center.copy()
        point.radius = 50
        this.point = point
    }

    draw(ctx){
        this.clear(ctx)

        const p = this.point
        p.lookAt(Point.mouse.position)
        p.pen.indicator(ctx, {color:'green'})
    }
}

stage = MainStage.go()
```

