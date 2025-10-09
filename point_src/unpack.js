/*

Reasoning

to receive inline or dict based args - because inline is nice but unwieldy,
as such - also allow dicts.

This allows for more complex options; later.
Also then we can process inline args with a dict.
And rearrange them later.



 */
const unpack = function(args, defaults) {
    /* read the args object into a dictionary (if required)
     use the `defaults` as as the defaults

    return an object. If args match an object, return
    with updates.

    one arg may be just a context.
    or an object of properties
    two args may be context and object.
    or context and prop

        let data = unpack(arguments, {
                otherPoint: undefined
                , color: undefined
                , width: undefined
            })

     Note, proxies are slower than objects
            https://www.measurethat.net/Benchmarks/Show/6274/4/access-to-proxy-vs-object
    */

    let l = args.length
    // maybe int skip for ctx bound functions.
    // therefore disable for non-ctx bound functions.
    let m = {
        0: ()=> {
            // console.log('no args')
            return defaults
        }
        , 1: ()=>{
            // ctx: CanvasRenderingContext2D
            // console.log('1 arg, return defaults')
            return defaults
        }
        , 2: ()=> {
            // ctx, def
            // console.log('2 args, return [1]')

            // merge with defaults.
            return Object.assign({}, defaults, args[1])
        }

    }[l];

    if(m) { return m() }

    // more than 2 args , therefore inline args.
    console.log('>2 args, unpack')

    let item = Object.entries(defaults)
    let res = Object.assign(defaults)

    for (let i = 1; i < args.length; i++) {

        /* res['key'] = value */
        // default == item[i][1]
        // userDefinedArg == args[i]
        // value is args val
        // is offset, because ctx is always 0
        let key = item[i-1][0]
           , v = args[i];
        if(args[i] === NULLY) {
            v = defaults[key]
        };
        res[key] = v
    }
    /*
        line(ctx, otherPoint, color, width) {
        let al = arguments.length
        let data = unpack(arguments, {})
    */
    return res;
}

const unpack0 = function(args, defaults) {
    /* read the args object into a dictionary (if required)
     use the `defaults` as as the defaults

    return an object. If args match an object, return
    with updates.

    one arg may be just a context.
    or an object of properties
    two args may be context and object.
    or context and prop

        let data = unpack(arguments, {
                otherPoint: undefined
                , color: undefined
                , width: undefined
            })

     Note, proxies are slower than objects
            https://www.measurethat.net/Benchmarks/Show/6274/4/access-to-proxy-vs-object
    */

    let l = args.length
    let offset = 0
    // maybe int skip for ctx bound functions.
    // therefore disable for non-ctx bound functions.
    let m = {
        0: ()=> {
            console.log('no args')
            return defaults
        }
        , 1: ()=> {
            // ctx, def
            console.log('2 args, return [1]')

            // merge with defaults.
            return Object.assign({}, defaults, args[offset])
        }

    }[l];

    if(m) { return m() }

    // more than 2 args , therefore inline args.
    console.log('>2 args, unpack')

    let item = Object.entries(defaults)
    let res = Object.assign(defaults)
    for (let i = offset; i < args.length; i++) {

        /* res['key'] = value */
        // default == item[i][1]
        // userDefinedArg == args[i]
        // value is args val
        // is offset, because ctx is always 0
        let key = item[i-offset][0]
           , v = args[i];
        if(args[i] === NULLY) {
            v = defaults[key]
        };
        res[key] = v
    }
    /*
        line(ctx, otherPoint, color, width) {
        let al = arguments.length
        let data = unpack(arguments, {})
    */
    return res;
}

const NULLY = null

const runUnpack = function(){
    return unpack(arguments, {})
}


const callRunUnpackLarge = function() {
    /* Use the runUnpackLarge */
    const ctx = {}

    // no conf, expect defaults.
    let a = runUnpackLarge(ctx)
    assert(a.sides == 7)
    assert(a.radius == undefined)


    // with a conf
    a = runUnpackLarge(ctx, {
                sides: 33
                , radius: 10
                , fromCenter: false  //: true
                , color: 'green'
                // , width  //: 1
                , angle: 20  //: 0
                // , open  //: true
                // , close  //: true
            })
    assert(a.sides == 33)
    assert(a.radius == 10)

    // conf with extra
    a = runUnpackLarge(ctx, {
        horse: 'tall'
    })

    assert(a.sides == 7)
    assert(a.radius == undefined)
    assert(a.horse == 'tall')

    // conf with extra and override.
    a = runUnpackLarge(ctx, {
        horse: 'tall'
        , sides: 12
    })

    assert(a.sides == 12)
    assert(a.radius == undefined)
    assert(a.fromCenter == true)
    assert(a.horse == 'tall')
    assert(a.color == undefined)
    assert(a.width == 1)
    assert(a.angle == 0)
    assert(a.open == true)
    assert(a.close == true)

    // inline
    a = runUnpackLarge(ctx, 22, 10, false, 'green')

    assert(a.sides == 22)
    assert(a.radius == 10)
    assert(a.fromCenter == false)
    assert(a.color == 'green')
    assert(a.width == 1)
    assert(a.angle == 0)
    assert(a.open == true)
    assert(a.close == true)

    // with skips
                        //sides, radius, fromcenter
    a = runUnpackLarge(ctx, 4, 5, NULLY, undefined, undefined, 20)

    assert(a.sides == 4)
    assert(a.radius == 5)
    assert(a.fromCenter == true)
    assert(a.color == undefined)
    assert(a.width == undefined) //explicitly undefined.
    assert(a.angle == 20)
    assert(a.open == true)
    assert(a.close == true)

    // with skips
                        //sides, radius, fromcenter
    a = runUnpackLarge(ctx, 4, 5, NULLY, NULLY, NULLY, 20)

    assert(a.sides == 4)
    assert(a.radius == 5)
    assert(a.fromCenter == true)
    assert(a.color === undefined)
    assert(a.width == 1)
    assert(a.angle == 20)
    assert(a.open == true)
    assert(a.close == true)


}


const assert = function(expr) {
    if(expr == true) {
        // good
        return
    }

    throw "Fail"// console.error('Fail')
}


const runUnpackLarge = function(ctx, sides, radius, fromCenter=true, color,
                                      width=1, angle=0, open=true, close=true) {
    /* This example receives many args. Same rules apply*/
    let data = unpack(arguments, {
                // default should not capture param 1
                sides: 7
                , radius
                , fromCenter: true
                , color: undefined
                , width: 1
                , angle  //: 0
                , open  //: true
                , close  //: true
            })
    return data
}




const runUnpackArgsDefault = function(ctx, otherPoint={}, color='red', width=1) {
    /*
        Unpack with defaults from the args. But the args is still applied.

    return defaults (otherPoint, color, width)

        d = runUnpackArgsDefault(stage.ctx);

    apply/override a config
        d = runUnpackArgsDefault(stage.ctx, { color: 'green' });

    extend defaults
        d = runUnpackArgsDefault(stage.ctx, { up: true });

    Be careful of the above (for this args defaults), as `otherPoint` is
    recast as the given object, therefore the `{ otherPoint }` default return,
    will return the config object, not the first default property:

        # bad:
        const runUnpackArgsDefault = function(ctx, otherPoint={}, color='red', width=1) {
            let data = unpack(arguments, {
                otherPoint
                , color
                , width
            })
        }

        # good:
        const runUnpackArgsDefault = function(ctx, otherPoint={}, color='red', width=1) {
            let data = unpack(arguments, {
                otherPoint: {} // altDefault
                , color
                , width
            })
        }




    */
    let al = arguments.length
    let data = unpack(arguments, {
                otherPoint
                , color
                , width
            })
    return data
}
