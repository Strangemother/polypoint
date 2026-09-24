class MainStage extends Stage {
    canvas = 'playspace'
    mounted() { }
    
    draw(ctx){
        this.clear(ctx)
    }
}

stage = MainStage.go()
