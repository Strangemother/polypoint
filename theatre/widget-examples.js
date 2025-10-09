/*
files:
    head
    point
    stage
    dragging
    pointlist
    mouse
    stroke
    fps
    ../point_src/functions/signedNorm.js
    ../theatre/objects/vectorpoint.js
    ../theatre/objects/spinplotter.js
---

*/

addWidget('multi', {
    fields: {
        alpha: { value: 0 }
        , beta: { value: 0 }
        , charlie: { value: 0 }
    }
})


addButton('button', {
    label: "Toggle Run"
    , onclick(){
        stage.buttonToggle = !stage.buttonToggle
    }
})

addSliderControlSet({
    alpha: { value: 1 }
    , beta: { value: 22 }
    , charlie: { value: 15 }
})

addSliderControl('Slider', {})

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.buttonToggle = true
        setInterval(()=>{
            if(this.buttonToggle) { this.updateMultiWidget() }
        }, 500)
    }

    updateMultiWidget() {
        updateWidgetValues('multi', {
            alpha: random.int(0, 1000).toFixed(2)
            , beta: random.int(0, 1000)
            , charlie: random.float(-1, 1).toFixed(3)
        })
    }

    draw(ctx){
        this.clear(ctx)
        this.fps.print(ctx)
    }
}

stage = MainStage.go()
