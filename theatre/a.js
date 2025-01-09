
const namedCommands = function(name, letter, ...positions){
    let res = {
        rel: letter.toLowerCase(),
        abs: letter.toUpperCase(),
        positions,
        name,
    }

    return buildCaller(res)
}


const buildCaller = function(info) {
    let handler = {
        info
        , get(target, prop, receiver) {
            return this.info[prop]
            // return Reflect.get(...arguments);
        }

        , apply(target, thisArg, argumentsList) {
            // console.log('Caller upon', thisArg, argumentsList)
            return magicCall(info, argumentsList, {owner: thisArg})
        }

    }

    return (new Proxy(function(){}, handler))
}


var removeAll = (arr, keys) => {for (prop of keys) arr.delete(prop); return arr};


const magicCall = function(info, argumentsList, options) {
    /* return a call if possible for the given object and args.
    the options may be a callable parent or dict with options to adapt */

    let positions = info.positions
    let shortArgs = argumentsList.length < positions.length
    let a0 = argumentsList[0]
    let objArgs = (argumentsList.length == 1)
                    && (
                        (a0 instanceof Object)
                        || (typeof(cg.coords) ==  'object')
                    )
    // console.log('magicCall', 'short:', shortArgs,  'isObj', objArgs)

    /*
        First convert positional or object arguments to an object of expected
        keys.
     */

    if((!objArgs) && shortArgs) {
        let missing = positions.slice(argumentsList.length)
        throw Error(`Expected Positional: ${positions} missing: ${missing} `)
    }

    let res = Object.assign({}, a0)
    // Pack args into a dict
    if(!objArgs) {
        var i;
        for (i = 0; i < positions.length; i++) {
            let name = positions[i];
            res[name] = argumentsList[i]
        }
    }

    // rebind additionals
    let extra = argumentsList.slice(i)
    extra = extra.length > 0? extra[0]: {} // one dictionary
    extra = Object.assign(extra, {case: 'rel'}, options)

    let missing = removeAll(new Set(positions), new Set(Object.keys(res)))
    missing = Array.from(missing)
    // console.log(res, 'missing', missing)

    if(missing.length > 0) {
        throw Error(`"${info.name}" Expected: ${positions} missing: ${missing}`)
    }

    /*
     now call upon the script putting the keys in position.
     */
    return new Command(res, info, extra)
}


class Command {

    constructor(data, header, options) {
        this.data = data
        this.header = header
        this.options = options
    }

    case(v) {
        if(v!=undefined) {
            this.options.case = v
            return this
        }
        return this.options.case // rel
    }

    rel(){
        return this.case('rel')
    }

    abs(){
        return this.case('abs')
    }

    get type() {
        return this.header[this.case()]
    }


    get name() {
        return this.header.name
    }
    get command() {
        let positions = this.header.positions
        return `${this.header.name} ${positions}`;
    }

    get [Symbol.toStringTag]() {
        return `${this.header.name} ${this.toString()}`;
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'string') {
            return this.toString()
        }
        return Reflect.apply(...arguments)
    }

    toString(){
        let positions = this.header.positions
        let res = []
        let data = this.data
        for(let key of positions) {
            res.push(data[key])
        }
        let parts = res; //maybe join
        return `${this.type} ${parts} `
    }
}


/*
MoveTo: M, m
LineTo: L, l, H, h, V, v
Cubic Bézier Curve: C, c, S, s
Quadratic Bézier Curve: Q, q, T, t
Elliptical Arc Curve: A, a
ClosePath: Z, z

 */
const _commands = {
     move: ['m', 'x','y']
    , arc: ['a', 'rx', 'ry', 'angle', 'largeArcFlag', 'sweepFlag', 'x', 'y']
    , line: ['l', 'x', 'y']
    , transpose: ['t', 'x', 'y']
    , quad: ['q', 'x1','y1', 'x','y']
    , smooth: ['s', 'x2','y2', 'x','y']
    , cubic: ['c', 'x1','y1', 'x2','y2', 'x','y']
    , vert: ['v', 'y']
    , horiz: ['h', 'x']
}


for(let key in _commands) {
    window[key] = _commands[key] = namedCommands(key, ..._commands[key])
    _commands[key].name = key
}


const commandsProxy = {
    get(target, prop, handler) {
        if(prop in target) {
            return target[prop]
        }
        // is a short name
        for(let key in target) {
            let t = target[key]
            let tt = t.rel
            if(tt == prop.toLowerCase()) {
                return target[key]
            }
        }
    }
}


const commands = new Proxy(_commands, commandsProxy)

