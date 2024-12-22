/*
A Nice angle conversion utility.

+ Angle extends Number

    a = Angle(180, 'deg')
    a.deg
    a.tau
    a.radians

    a = tau`2.1`
    // Angle(a, 'tau')
    a.degrees

functions

    d | deg | degrees
    t | tau | turn
    g | gon | grad | gradian
    r | rad | rads | radians
    h | hour
    b | binary
    compass

    rpm
 */
// ----- DEGREES -----
const AngleConvertTable = {
    degrees:{
        turns: (deg) => deg / 360
        , gradians: (deg) => deg * (400 / 360) // or deg * (10/9)
        , radians: (deg) => deg * (Math.PI / 180)
    }
    , turns:{
        degrees: (turn)=>turn * 360
        , gradians: (turn)=>turn * 400
        , radians: (turn)=>turn * 2 * Math.PI
    }
    , gradians:{
        degrees: (grad)=>grad * (360 / 400) // or grad * 0.9
        , turns: (grad)=>grad / 400
        , radians: (grad)=>grad * (Math.PI / 200)
    }
    , radians:{
        degrees: (rad) => rad * (180 / Math.PI)
        , turns: (rad) => rad / (2 * Math.PI)
        , gradians: (rad) => rad * (200 / Math.PI)
    }
}


class Angle {

    defaultType = undefined
    // defaultType = 'degrees'
    constructor(value, type=this.defaultType) {
        this.type = type
        this.value = value
    }

    static from(v, t) {
        return new this(v,t)
    }

    set type(v) {
        this._type = this.resolveType(v)
    }

    get type() {
        return this._type
    }

    resolveType(v){
        return angleConstantsMap.get(v)
    }

    as(toType, value=this.value){
        let fromType = this.type
        let rToType = this.resolveType(toType)
        if(fromType == rToType) {
            return value
        }

        if(fromType === undefined) {
            /* No inner type, return a new Angle with this type
                Angle(30).tau
            */
           return new this.constructor(this.value, rToType)
        }

        console.log('Converting', fromType, rToType)

        let top = AngleConvertTable[fromType]
        // console.log('top', top)
        let f = top[toType]
        // console.log('f', f)
        return f(value)
    }

    table() {
        let top = AngleConvertTable[this.type]
        let result = {}
        result[this.type] = this.value
        for(let name in top) {
            result[name] = top[name](this.value)
        }
        return result
    }

    toLongString(toType) {
        let fromType = this.type
        let rType = this.resolveType(toType)
        let v = this.as(rType)
        let bits = [this.value, fromType, '==', v, rType,]
        return bits.join(' ')
    }

    invert() {
        // perform a 180
    }
}


let angleAliasStack = {
      degrees: ['d', 'deg', 'degree']
    , turns: ['t', 'tau', 'turn']
    , gradians: ['g', 'gon', 'grad', 'gradian']
    , radians: ['r', 'rad', 'radian']
    // , hour: ['h', 'hour']
}

let angleConstantsMap = new Map()

for(let k in angleAliasStack) {
    // let tname = [k.slice(0,1).toUpperCase(), k.slice(1)].join('')
    let name = k
    angleConstantsMap.set(k, name)
    angleAliasStack[k].forEach(n => {
        angleConstantsMap.set(n, name)
        Object.defineProperty(Angle.prototype, n, {
            get() {
                return this.as(name)
            }//.bind({key:n, name, parent: this})

        })

        if(n.length > 1) {
            Object.defineProperty(Angle.prototype, `${n}s`, {
                get() {
                    return this.as(name)
                }//.bind({key:n, name, parent: this})

            })
        }
    })
}