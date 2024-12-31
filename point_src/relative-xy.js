

class XY extends Array {

    get x() {
        return this[0]
    }

    get y() {
        return this[1]
    }

    multiply(v) {
        this[0] *= v
        this[1] *= v
        return this
    }

    mul(){ return this.multiply.apply(this, arguments) }
}



class Relative {

    constructor(opts={}){
        // super(opts)
        this._relativeData = [0, 0, 0, 0]
    }

    getRelativeData() {
        let r = this._relativeData
        if(r == undefined) {
                                    //x,y,rad,rot
            r = this._relativeData = [0, 0, 0, 0]
        }
        return r
    }

    get rel() {
        let parent = this;
        let r = this._rel
        if(r != undefined) {
            return r
        }

        let relData = this.getRelativeData()
        let sp = {
            get x(){
                return relData[0]
            }

            , set x(v) {
                relData[0] = v
            }

            , get y(){
                return relData[1]
            }

            , set y(v) {
                relData[1] = v
            }

            , get radius() {
                return relData[2]
            }

            , set radius(v) {
                return relData[2] = v
            }

            , get rotation() {
                return relData[3]
            }

            , set rotation(v) {
                return relData[3] = v
            }

            , clear() {
                // delete all values
                parent._relativeData = [0,0,0,0]
            }
        }

        this._rel = sp
        return sp
    }

    set rel(v) {
        this._opts.rel = v
    }

    set xy(other) {
        /* Set a X Y pair on the entity, receiving from
        another XY, or Point*/
        this.x = other[0]
        this.y = other[1]
    }

    get xy() {
        // return the XY
        return new XY(this.x, this.y,)
    }

}
