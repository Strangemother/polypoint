/*
---
title: Semi Circle.
categories:
    arc
    angles
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/protractor.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
    ../point_src/angle.js
    ../point_src/text/label.js
    ../point_src/random.js
    ../point_src/arc.js
    ../point_src/tethers-vec.js
    ../point_src/protractor.js
---

Draw a semi-circle to another point _through_ a third point.

*/

class TrackPoint extends Point {
    xSet(value) {
        if(this._prevX == value) {
            return
        }

        // console.log('x', value)
        this.dirty = true;
        this._prevX = value;

    }

    ySet(value) {
        if(this._prevY == value) {
            return
        }

        // console.log('y', value)
        this.dirty = true;
        this._prevY = value;

    }

    step() {
        if(this.dirty) {
            // console.log('step')
            this.dirty = false
            this.lookAt(this.pin)
            if(this.other.dirty == false) {
              this.other.update(projectFrom(this, 300))
            }
        }
    }
}


class MainStage extends Stage {
    canvas='playspace'

    createPair(pin){

        let linkA = new PointList({
                  x:200, y:300,
                  pin,
                  color: 'cyan'
              }, {
                  x:210, y:190,
                  pin,
                  color: 'purple',
              }).cast(TrackPoint)

        linkA[0].other = linkA[1]
        linkA[1].other = linkA[0]
        return linkA
    }

    mounted(){
        this.spinner = new Point({x:200, y:150, radius: 80, color: '#880000'})

        this.pinPoint = new Point({x:420, y:150, radius: 10, color: '#880000'})
        this.pinPoint2 = new Point({x:450, y:150, radius: 10, color: '#880000'})

        this.linkA = this.createPair(this.pinPoint)
        this.linkB = this.createPair(this.pinPoint2)

        this.linkA[1].xy = random.within(this.spinner)

        this.spinner.tethers.add(this.linkA[1])
        this.spinner.tethers.add(this.linkB[1])

        this.dragging.addPoints(
              this.spinner,
              this.pinPoint,
              this.pinPoint2,
            )
    }

    updateLink(link){
        link[1].dirty = true

        link[0].step()
        link[1].step()
    }

    drawPin(ctx, pin) {
        pin.pen.circle(ctx, {color: 'purple'})
        pin.pen.fill(ctx, '#990290', 3)
    }

    drawLink(ctx, link) {
        link.pen.indicator(ctx)
        link.pen.line(ctx)
    }

    draw(ctx){
        this.clear(ctx)

        ctx.fillStyle = '#555'
        ctx.strokeStyle = 'orange'

        this.spinner.tethers.step()

        this.updateLink(this.linkA)
        this.updateLink(this.linkB)

        this.drawPin(ctx, this.pinPoint)
        this.drawPin(ctx, this.pinPoint2)

        this.drawLink(ctx, this.linkA)
        this.drawLink(ctx, this.linkB)

        this.spinner.pen.indicator(ctx)
        this.spinner.rotation += 2
    }

}


;stage = MainStage.go();

