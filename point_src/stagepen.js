/*

Pen functions for more generic things, such as ctx.fill()

    stage.pen.fill()
    stage.pen.fill('red')
 */


class StagePen {

    constructor(stage) {
        this.parent = stage
    }

    fill(ctx=this.parent, color=UNSET) {
        let d = unpack(arguments, { color })

        if(color == UNSET) {
            ctx.fill()
            return
        }

        let b4 = ctx.fillStyle
        ctx.fillStyle = d.color
        ctx.fill()
        ctx.fillStyle = b4

    }
}


Polypoint.head.deferredProp('Stage', function pen(){
    return new StagePen(this)
})