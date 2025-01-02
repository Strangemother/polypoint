class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50
    }

    draw(ctx){
        this.clear(ctx)

        let c = this.center
        c.lookAt(Point.mouse.position)
        c.pen.indicator(ctx, {color:'green'})
    }
}

stage = MainStage.go()

