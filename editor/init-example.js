class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){

    }

    draw(ctx){
        this.clear(ctx)
        this.center.pen.indicator(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)