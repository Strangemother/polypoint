/*
title: Stick Figure Animation
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
        let midline = this.center.copy()
            , mx = midline.x
            ;

        class BodyPoint extends Point {
            created() {
                if(this._opts.radius != undefined) return;
                this.radius = 8
            }

        }

        this.points = new PointList(
                // name, x, y, radius
              ['head',      mx, 150, 50]
            , ['neck',      400, 180]
            , ['shoulders', mx, 200, 10]
            // arm
            , ['elbow',     mx-20, 220]
            , ['hand' ,     mx, 230]

            // right arm
            , ['elbow',  mx+20, 240]
            , ['hand',   mx+40, 250]

            // left leg
            , ['hips',   mx-20, 260, 15]
            , ['leg' ,   mx-50, 310]

            , ['foot',    mx, 320]
            , ['leg',    mx, 340]
            , ['foot',   400, 520]
        ).cast(BodyPoint, function(arrItem, type){
            let [name, ...xyr] = arrItem
            let o = new type(xyr)
            o.name = name
            return o
        })

        this.points.update({
            vx: .1, vy: 0, mass: 1
        });

        let cb = this.collisionBox = new CollisionBox()
        cb.points.push(this.points[0])
        cb.points.push(this.points[4])
        cb.points.push(this.points[6])
        cb.points.push(this.points[9])
        cb.points.push(this.points[11])
        this.g = new GraphConnections;

        this.head = 0
        this.distances = {}
        let shoulderIndex = this.points.indexOf(this.points.getByName('shoulders'))
        let hipIndex = this.points.indexOf(this.points.getByName('hips'))

        // head neck
        this.g.connect(0, 1)
        this.g.connect(1, shoulderIndex)

        // left arm
        this.g.connect(shoulderIndex, 3, 4)
        // right arm
        this.g.connect(shoulderIndex, 5, 6)

        // torso hips.
        let sizes = [
            ['shoulders', 'hips', 110]
            , ['leg', 'hips', 100]
            , ['foot', 'leg', 100]
            , ['hand', 'elbow', 75]
            , ['head', 'neck', 50]
            , ['shoulders', 'neck', 15]
            , ['shoulders', 'elbow', 70]
        ]

        this.sizes = sizes
        sizes.forEach(v=>{
            // this.distances["shoulders-hips"] = this.distances["hips-shoulders"] = 110
            this.distances[`${v[1]}-${v[0]}`] = this.distances[`${v[0]}-${v[1]}`] = v[2]
        })

        this.g.connect(shoulderIndex, hipIndex)

        this.g.connect(hipIndex, 8, 9)
        this.g.connect(hipIndex, 10, 11)

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
        // this.points[7].xy = this.center.xy

        // head
        this.points[0].pen.fill(ctx, 'purple')
        // hip
        this.points[7].pen.fill(ctx, '#00cc3355')
        this.points[4].pen.line(ctx, undefined, 'purple', 2)
        this.points[6].pen.line(ctx, undefined, 'purple', 2)

        this.g.forPair((ia,ib)=>{
            let pa = this.points[Number(ia)]
            if(!pa) {
                return
            }

            pa.pen.line(ctx, this.points[Number(ib)], 'purple', 2)
        });
        // this.points.pen.indicators(ctx, {color: '#555'})

    }

    graphChain(head, ps) {

        let distances = this.distances;

        let pairCallback = (key, fromKey, allTargets)=>{
            // console.log('from=', fromKey, 'key=', key, )
            // constraints.within(ps[fromKey], ps[key], 50)
            let dis = distances[`${ps[fromKey].name}-${ps[key].name}`]
            if(dis == undefined) {
                dis = 50
            }

            constraints.distance(ps[fromKey], ps[key], dis)
        }

        // if(head != 7){
        //     this.g.walkForward(7, pairCallback)
        // }
        this.g.walkForward(head, pairCallback)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
