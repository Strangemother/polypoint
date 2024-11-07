
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.point = new Point(300, 400, 100)
        this.point2 = new Point(600, 400, 100)

        this.projection = this.point.project()
        this.projection2 = this.point2.project()

        this.dragging.add(this.point, this.point2, this.projection, this.projection2)
    }

    coupling() {
        this.point.lookAt(this.projection)
        this.point.radius = this.point.distanceTo(this.projection)

        this.point2.rotation = this.point.rotation + 180
        this.point2.radius = this.point.radius
    }

    draw(ctx){
        this.clear(ctx)
        this.coupling()
        let pos = this.mouse.position
        pos.pen.circle(ctx)

        this.point.pen.indicator(ctx)
        this.point2.pen.indicator(ctx)

        this.projection.pen.fill(ctx, '#33DDAA')
        // this.projection2.pen.fill(ctx, '#33DDAA')

    }
}

;stage = MainStage.go();