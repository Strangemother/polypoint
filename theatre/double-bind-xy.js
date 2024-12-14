/*
title: double Bind XY
src_dir: ../point_src/
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    dragging
    pointlist
    mouse
    stroke
    ../point_src/split.js
    ../point_src/stage-clock.js
    ../point_src/touching.js
    ../point_src/coupling.js
---

Bind the XY of two points, ensuring movement (such as _dragging_) of one entity,
affects the other.
*/

// Works.
class XYBindMap {
    constructor() {
        this.bindMap = new Map()
        this.bindMapRev = new Map()
    }

    step(){
        const pairTest = (vChild, kOwner)=>{
            /* Iterate the bindmap, ensuring the XY of a pair match
            Propagate the changed value (dirty) to the unchanges value. */
            let target = undefined //vChild
            let parent = undefined // kOwner

            /* Stringy here, as that correctly tests the array == array */
            let kOwner_dirty = kOwner._xy && kOwner._xy.toString() != kOwner.xy
            let vChild_dirty = vChild._xy && vChild._xy.toString() != vChild.xy

            // alt dirty check.
            vChild_dirty = vChild._dirty == undefined? vChild_dirty: vChild._dirty// || (~~vChild.xy == ~~kOwner.xy)
            kOwner_dirty = kOwner._dirty == undefined? kOwner_dirty: kOwner._dirty// || (~~kOwner.xy == ~~vChild.xy)
            if(vChild._updateRequired) {
                // console.log('dirty child')
                kOwner_dirty = true
            }

            if(kOwner._updateRequired) {
                // console.log('dirty owner')
                vChild_dirty = true
            }


            if(kOwner_dirty === true) {
                /*
                    The parent is dirty, push the changes to the child.
                */
                // vChild.xy = kOwner.xy
                target = vChild
                parent = kOwner
                // console.log('dirty owner')
            }

            if(vChild_dirty === true) {
                /* The child vars are dirty, propagate to the parent */
                // copy back to parent.
                target = kOwner
                parent = vChild
            }

            let updateRequired = target && target._updateRequired == true
            let parentUpdateRequired = parent && parent._updateRequired == true

            if(parentUpdateRequired || updateRequired || kOwner_dirty || vChild_dirty) {
                /*
                    Only occurs if either are dirty, pushing the _dirty_ (changed)
                    value to the currently unchanged.
                 */
                const updateFunction = function() {
                    target.xy = parent.xy
                }

                const smoothUpdateFunction = function() {

                    let xy = target.xy
                    let d = distance2D(xy, parent.xy)
                    // console.log(d)
                    target.xy = [
                          xy[0] - (d.x * .1)
                        , xy[1] - (d.y * .1)
                    ]

                    target._updateRequired = !(d.distance < 5)
                }

                // target && (target._dirty = true)// d < target.radius
                // target._updateRequired = !(d.distance < 5)
                // smoothUpdateFunction()

                updateFunction()
                // console.log(target.radius, target._updateRequired)
            }


            // Is now clean.
            vChild._xy = vChild.xy
            kOwner._xy = kOwner.xy

        }

        this.bindMap.forEach(pairTest)
    }

    connect(parent, child) {

        // child.parentWheel = parent
        // parent.childWheel = child
        child.xy = parent.xy
        // child.isPinion = true
        this.bindMap.set(parent, child)
        this.bindMapRev.set(child, parent)
    }
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.bindMap = new XYBindMap()

        let r = this.generate()
        this.points = r
        this.dragging.add(...r)
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
    }

    generate(pointCount=2){

        let ps = new PointList(
            new Point({x:100, y:200, radius: 150}),
            new Point({x:700, y:200, radius: 25}),

            new Point({x:600, y:400, radius: 100}),
            new Point({x:600, y:100, radius: 20}),

            new Point({x:659, y:500, radius: 120}),
            new Point({x:150, y:450, radius: 20}),

            new Point({x:180, y:150, radius: 140}),
            new Point({x:180, y:150, radius: 15}),

            new Point({x:100, y:200, radius: 70}),
            new Point({x:800, y:300, radius: 70})
        )

        this.bindMap.connect(ps[0], ps[1])
        this.bindMap.connect(ps[2], ps[3])
        this.bindMap.connect(ps[4], ps[5])
        this.bindMap.connect(ps[6], ps[7])

        return ps
    }

    onEmptyDown(ev) {
        // console.log('onEmptyDown')
        const p = Point
                    .from(ev)
                    .update({
                        radius: 60
                        , angularVelocity: 1
                    })
                    ;
        this.points.push(p)
        this.dragging.add(p)
    }

    draw(ctx){
        this.clear(ctx)

        /* To ensure the bindmap correctly updated, call when required.*/
        this.bindMap.step()

        this.points.pen.indicators(ctx)

        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

}

stage = MainStage.go()