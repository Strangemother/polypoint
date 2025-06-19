/*
title: Graph Based Rotation
categories:
    raw
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

Rotating any one point rotates them all.

---

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
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

        this.graphChain(this.head, ps)
        this.points.pen.indicators(ctx)

        // head
        this.points[0].pen.fill(ctx, '#99221155')
        // tri joint
        this.points[2].pen.fill(ctx, '#00cc3355')


    }

    graphChain(head, ps) {

        let pairCallback = (key, fromKey, allTargets)=>{
            // console.log('from=', fromKey, 'key=', key, )
            constraints.within(ps[fromKey], ps[key], 50)
            // constraints.distance(ps[fromKey], ps[key], 50)
        }

        this.g.walkForward(head, pairCallback)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
