/*
    title: Coupled Lines
    files:
        head
        point
        stage
        pointlist
        mouse
        dragging
        ../point_src/bisector.js
*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true

    mounted(){
        let a = this.pa = new Point(150, 150, 20, 90)
        let b = this.pb = new Point(400, 250, 20, 90)
        let m = this.mid = new Point(200, 300, 60, 100)
        this.dragging.add(a,b, m)
    }

    coupling() {
    }

    draw(ctx){
        this.clear(ctx)
        this.mid.radians = acuteBisect(this.pa, this.mid, this.pb)
        this.pa.pen.fill(ctx, '#AA33CC')
        this.pb.pen.fill(ctx, '#AA33CC')
        this.mid.pen.indicator(ctx)
    }
}

;stage = MainStage.go();