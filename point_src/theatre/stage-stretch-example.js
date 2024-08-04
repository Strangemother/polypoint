/*
A stage will adapt to its global size.

    #playspace {
        height: 100%;
        width: 100%;
        border: solid 1px;
    }

When resizing the page, the `canvas` element dimensions will change.
The Stage will adapt after the resize event.
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50
    }

    draw(ctx){
        this.clear(ctx)

        let c = this.center
        // c.lookAt(Point.mouse.position)
        c.pen.indicator(ctx, {color:'green'})
    }
}

stage = MainStage.go()
