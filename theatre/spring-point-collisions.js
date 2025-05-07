/*
title: Graph Chain Follow Points V3
categories: springs
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

In this version the pair callback method - tests for visits.

---

The `followPoint` method allows a point to _follow_ another point, at a distance.
This is a lot like constraints but with a _one to one_ relationship in a single
direction.

This _graph chain_ stores those one to one relationships, with methods to iterate
the chain in two directions. This allows use to grab the standard `A -> B -> C`,
and `C -> B -> A`.

The graph can resolve a "star based" configuration:

    A      C
      \   /
        B
        |
        D
        |
        E

Each connection is given in a pair, from an origin node (the `head`)

    head = B

    B -> C
    B -> D [ -> E ]
    D -> E
    B -> A
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
/*        this.points = new PointList(
            new Point(250, 150, 10)
            , new Point(400, 320, 10)
            , new Point(300, 520, 8)

            , new Point(340, 580, 8)
            , new Point(380, 520, 8)

            , new Point(410, 520, 8)
            , new Point(450, 520, 8)

            , new Point(430, 520, 8)
            , new Point(400, 520, 8)
        )
*/
        this.points = new PointList(
            new Point({x:250, y:150, radius:10, vx: .1, vy: 0, mass: 1 })
            , new Point({x:400, y:320, radius:10, vx: .1, vy: 0, mass: 1 })
            , new Point({x:300, y:520, radius:8, vx: .1, vy: 0, mass: 1 })

            , new Point({x:340, y:580, radius:8, vx: .1, vy: 0, mass: 1 })
            , new Point({x:380, y:520, radius:8, vx: .1, vy: 0, mass: 1 })

            , new Point({x:410, y:520, radius:8, vx: .1, vy: 0, mass: 1 })
            , new Point({x:450, y:520, radius:8, vx: .1, vy: 0, mass: 1 })

            , new Point({x:430, y:520, radius:8, vx: .1, vy: 0, mass: 1 })
            , new Point({x:400, y:520, radius:8, vx: .1, vy: 0, mass: 1 })
        )

        this.collisionBox = new CollisionBox(this.points)
        this.g = new GraphConnections;

        this.head = 0

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

        // let mouse = Point.mouse.position
        // followPoint(mouse, this.points[0], 50)
        let ps = this.points


        // ps[5].spring.to(ps[6], 30, .2, .9, undefined, .02)
        this.graphChain(this.head, ps)
        this.points.pen.indicators(ctx)

        // head
        this.points[0].pen.fill(ctx, '#992211')
        // tri joint
        this.points[2].pen.fill(ctx, '#00cc33')
    }

    graphChain(head, ps) {
        // let head = this.head
        // let ps = this.points
        let visits = {}
        let locked = new Set([head])
        let pairCallback = (key, fromKey, allTargets)=>{
            // console.log('from=', fromKey, 'key=', key, )
            // constraints.within(ps[fromKey], ps[key], 50)

            // constraints.distance(ps[fromKey], ps[key], 50)

            ps[key].spring.to(ps[fromKey], 40, .2, .92, locked, .2)

            if(visits[fromKey] == undefined) { visits[fromKey] = 0 }
            if(visits[key] == undefined) { visits[key] = 0 }

            visits[fromKey] += 1
            visits[key] += 1
            if(visits[key] == 1){ ps[key].lookAt(ps[fromKey]) }
        }

        this.g.walkForward(head, pairCallback)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
