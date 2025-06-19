/*

A ScreenWrap manipulated the XY of a point, if it travels outside the wrap
space.

    let topLeft = [50, 50]
        , bottomRight = [800, 800]

    s = new ScreenWrap(topLeft, bottomRight)

Check and alter point positions as they move in the draw routine:

    s.perform(point)

This is setup be default on the stage, saving the setup part and screen resize
tracking:

    stage.screenWrap.perform(point)
*/

class ScreenWrap {
    edgeMethod = 'performWrap'

    constructor(topLeft = [50, 50], bottomRight = [800, 800]) {
        this.topLeft = topLeft
        this.bottomRight = bottomRight
    }

    setDimensions(dimensions) {
        let d = dimensions
        this.topLeft = [d.top, d.left]
        this.bottomRight = [d.bottom, d.right]
    }


    perform(p, topLeft=this.topLeft, bottomRight=this.bottomRight, edgeMethod=this.edgeMethod) {
        return this[edgeMethod](p, topLeft, bottomRight)
    }

    performWrap(p, topLeft=this.topLeft, bottomRight=this.bottomRight) {
        /* wrap */
        let didChange = false;
        let px, opx = p.x
        let py, opy = p.y
        let d = p.screenWrapSector?p.screenWrapSector:{x: 0, y: 0, dirty:true}

        // through left wall
        if(opx < topLeft[0]) {
            px = bottomRight[0]
            d.x -= 1
        }

        // through top
        if(opy < topLeft[1]) {
            py = bottomRight[1]
            d.y -= 1
        }

        // through right
        if(opx > bottomRight[0]) {
            px = topLeft[0]
            d.x += 1
        }

        // through bottom
        if(opy > bottomRight[1]) {
            py = topLeft[1]
            d.y += 1
        }

        if(px != undefined) {
            p.x = px
            didChange = d.dirty = true
            p.screenWrapSector = d;

        }

        if(py != undefined) {
            p.y = py
            didChange = d.dirty = true
            p.screenWrapSector = d;
        }

        return didChange
    }

    performMany(points, topLeft=this.topLeft, bottomRight=this.bottomRight) {
        points.forEach(p=>this.perform(p, topLeft, bottomRight))
    }

    isOutside(p, topLeft=this.topLeft, bottomRight=this.bottomRight) {
        return (
            p.x < 0
            || p.y < 0
            || p.x > 800
            || p.y > 800
            )
    }
}

class ScreenWrapCull extends ScreenWrap {
    /* Delete points from the associated points
    rather than _wrapping_ the point. */

    edgeMethod = 'performCull'

    performCull(p, topLeft=this.topLeft, bottomRight=this.bottomRight, deletePointFunction=this.destroyPoint) {
        /* wrap */

        let px, opx = p.x
        let py, opy = p.y
        let d = p.screenWrapSector?p.screenWrapSector:{x: 0, y: 0, dirty:true}
        let destroy = false

        // through left wall
        if(opx < topLeft[0]) {
            px = bottomRight[0]
            // d.x -= 1
            destroy = true
        }

        // through top
        if(opy < topLeft[1]) {
            py = bottomRight[1]
            // d.y -= 1
            destroy = true
        }

        // through right
        if(opx > bottomRight[0]) {
            px = topLeft[0]
            // d.x += 1
            destroy = true
        }

        // through bottom
        if(opy > bottomRight[1]) {
            py = topLeft[1]
            // d.y += 1
            destroy = true
        }

        if(destroy) {

            deletePointFunction(p)
        }

        return destroy
    }

    destroyPoint(point) {
        // console.log('destroyPoint')
        point.destroy && point.destroy()
    }
}


class StageScreenWrap extends ScreenWrapCull {

    edgeMethod = 'performWrap'

    constructor(parent) {
        let d = parent.dimensions
        super([0, 0], [d.width, d.height])
        this.stage = parent
        parent.events.on('resize', (e)=>{
            this.copyStageDimensions()
        })
    }

    copyStageDimensions(dimensions=this.stage.dimensions) {
        this.setDimensions({
                top: 0, left: 0
                , bottom: dimensions.width, height: dimensions.height
            })
    }

    cullBox(points, deletePointFunction, topLeft=this.topLeft, bottomRight=this.bottomRight) {
        points.forEach(p=>{
            this.performCull(p, topLeft, bottomRight, deletePointFunction)
        })
    }
}


Polypoint.head.deferredProp('Stage', function screenWrap(){
    return new StageScreenWrap(this)
})
