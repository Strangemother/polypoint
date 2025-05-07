
class ScreenWrap {


    constructor(topLeft = [50, 50], bottomRight = [800, 800]) {
        this.topLeft = topLeft
        this.bottomRight = bottomRight
    }

    setDimensions(dimensions) {
        let d = dimensions
        this.topLeft = [d.top, d.left]
        this.bottomRight = [d.bottom, d.right]
    }

    perform(p, topLeft=this.topLeft, bottomRight=this.bottomRight) {
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

    isOutside(p, topLeft=this.topLeft, bottomRight=this.bottomRight) {
        return (
            p.x < 0
            || p.y < 0
            || p.x > 800
            || p.y > 800
            )
    }
}