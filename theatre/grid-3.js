class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'canvas'

    mounted(){
        this.points = PointList.generate.grid(100, 10, 50)
        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicators(ctx)
    }
}

stage = MainStage.go()
