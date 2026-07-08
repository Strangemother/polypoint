/*
title: (Better) Control Point
files:
    head
    point
    pointlist
    mouse
    dragging
    stage
    stroke

---

A better "control point" for a point. In this version we use the points builtin
`dirty` flag, coupling the points using a simple _is dirty_ test.

*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.cp = new Point(this.point.getTip())
        this.cp._dirty = false;
        this.dragging.add(this.point, this.cp)
    }

    draw(ctx){
        this.clear(ctx)

        if(this.cp.wasDirty) {
            this.point.lookAt(this.cp)
            this.point.radius = this.point.distanceTo(this.cp)
        }

        if(this.point.wasDirty) {
            this.cp.copy(this.point.getTip())
            this.cp._dirty = false;
        }

        this.point.pen.indicator(ctx);
        this.cp.pen.indicator(ctx);
    }
}


stage = MainStage.go(/*{ loop: true }*/)

