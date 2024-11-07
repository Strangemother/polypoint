
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let p = this.point = new MyPoint(300,200)
        this.dragging.add(p)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.indicator(ctx)
    }
}


stage = MainStage.go()