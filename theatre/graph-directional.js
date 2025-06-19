/*
title: Directional Graph
categories:
    graph
files:
    head
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    dragging
    pointlist
    point
    stage
    mouse
    ../point_src/graph-connections.js
    ../point_src/constrain-distance.js
    ../point_src/constrain-distance-locked.js
    ../point_src/collisionbox.js
    ../point_src/functions/springs.js
    ../point_src/velocity.js
    stroke
---

A directional graph connects nodes in one direction (`a=>b`).
Clicking on a single node highlights the children.

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let ps = this.points = new PointList(
            {x:250, y:150, radius:10 }
            , {x:400, y:320, radius:10 }
            , {x:300, y:520, radius:8 }

            , {x:340, y:580, radius:8 }
            , {x:380, y:520, radius:8 }

            , {x:410, y:520, radius:8 }
            , {x:450, y:520, radius:8 }

            , {x:430, y:520, radius:8 }
            , {x:400, y:520, radius:8 }
        ).cast()

        this.collisionBox = new CollisionBox(this.points)
        // this.g = new GraphConnections;
        this.g = new DirectionalGraphConnections;

        this.head = 5

        this.g.connect(0, 1, 2, 3, 4)
        this.g.connect(2, 5)
        this.g.connect(5, 6, 7, 8)

        this.dragging.add(...this.points)
    }

    onMousedown(ev, p) {
        // console.log(this.dragging._near)
        this.head = this.points.indexOf(this.dragging._near)
    }

    draw(ctx){
        this.clear(ctx)
        this.collisionBox.shuffle()

        let ps = this.points

        this.graphChain(ctx, this.head, ps)
        this.points.pen.indicators(ctx)

        // head
        this.points[this.head]?.pen.fill(ctx, '#44cc33')
        this.points[0].pen.fill(ctx, '#99221155')
        // tri joint
        this.points[2].pen.fill(ctx, '#00cc3355')
    }

    graphChain(ctx, head, ps) {

        // this.g.walkForward(this.head, (key, fromPoint, allTargets)=>{
        //     ps[key].pen.circle(ctx, ps[fromPoint].radius + 3, 'red')
        // })

        this.g.getChain(this.head, (key, leaf)=>{
            ps[key]?.pen.circle(ctx, ps[key].radius + 3, leaf? 'green': 'red')
        })

        this.g.walkForward(this.head, (key, fromPoint, allTargets)=>{
            ps[key].pen.line(ctx, ps[fromPoint])
            // key.rotation = fromPoint.rotation
        })
    }

}

stage = MainStage.go(/*{ loop: true }*/)
