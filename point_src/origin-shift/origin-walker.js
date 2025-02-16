/*

A cursor to walk the maze.

It should act like a indicator, stepping through connection.

1. history?
2. error checks

Each step looks at the current index and get the next allowed posistions.
*/

class Walker {

    constructor(os, index=undefined){
        console.log('walker', os)
        // origin instance, with points and controls.
        this.os = os
        /* index or _position_ of the walker.
        The cursor position */
        this.index = index
    }

    forceStep(dir='right') {
        /* Be a controller point, where we define the path by altering the
        maze. */
        let near = os.getNear(this.index)

        if(near[dir] == undefined) {
            console.error('Cannot walk in direction', dir)
            return false;
        }

        os.moveTo(near[dir])
        return true
    }

    step(dir='right') {
        let _do = this.doStep(dir)
        if(_do != false) {
            // console.log('moving to', _do)
            this.index = _do
            // os.moveTo(_do)
        } else {
            console.warn('cannot go that way.')
        }
        return this.index
    }

    doStep(dir='right') {
        /* Walk the maze as a player. Hitting a wall */
        let index = this.index
        if(index == undefined){
            index = os.origin
        }
        let near = os.getNear(index)

        if(near[dir] == undefined) {
            console.error('Cannot walk in direction', dir)
            return false;
        }

        // Now we test if the _current_ cell has the target,
        let target = near[dir]
        let curPoint = os.pointList[index]
        let tarPoint = os.pointList[target]
        // console.log('Move from', index, 'to', target, dir)
        // console.log(`tarPoint.target=${tarPoint.target}`)
        // console.log(`tarPoint.target=${tarPoint.target}`)

        if(curPoint.target == target) {
            /* This point is looking at the other - can move. */
            return target
        }

        if(tarPoint.target == index) {
            /* the _other_ point is looking at this one - can move.
            (abeit anti-along the line) */
            return target
        }

        /* Neither _this_ point, other _the other_ point create
        a bridge - therefore - nowhere to go. */

        return false
    }
}