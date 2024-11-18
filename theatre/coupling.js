/*
---
title: Coupling Points
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/protractor.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/text/label.js
    ../point_src/text/alpha.js
---

Bind many points
 */


// examples
// b.x = a.x
// double binding required a more complex proxy watch.

// altered bound.
// b.x = a.x + 10

class Coupling {

    constructor() {
        this.pairs = new Set
    }

    couple(a, b, relativeOffset, keys=['x', 'y','radius', 'rotation']) {
        /*
        Couple two points, binding the x,y,radius,rotation
        Apply a relative offset to update the values between binding changes

        when a side is manipulated, the _other_ side is updated.
        If B is the altered value, the relativeOffset is applied inversly.

        Apply a function to the relative offset key to capture live change.s
        */

        // if relativeOffset is array, assume norm
        // if dict, use keys.
        let offset = relativeOffset
        if(Array.isArray(relativeOffset)) {
            offset = {}
            relativeOffset.forEach((v,i,a)=>{
                if(v === undefined || v === null) {
                    return
                };
                offset[keys[i]] = v
            })
        }


        let perform = undefined;

        let aName = a.asArray().join('')
        let bName = b.asArray().join('')

        // store a and b as testable values
        this.pairs.add({a, b, offset, keys, aName, bName})
    }

    step(){
        // when any side is a mismatch, recalc the offset and ripple to others
        // if both sides are edited, force a to b.
        const FORWARD_SET = true
        const REVERSE_SET = false

        this.pairs.forEach(item=>{
            let a = item.a
            let b = item.b

            let an = a.asArray().join('')
            let bn = b.asArray().join('')

            let perform = undefined;

            if(an != a.aName) {
                perform = FORWARD_SET
            }

            if(bn != b.bName) {
                if(perform != undefined) {
                    /* race condition - force A*/
                    perform = FORWARD_SET
                } else {
                    perform = REVERSE_SET
                }
            }

            a.aName = an;
            b.bName = bn;

            if(perform == undefined) {
                return
            };

            console.log('a, b', perform)//, item.keys)
            /* perform has set, true for forward, false for inverted */

            // Need option for a Point
            if(perform == true) {

                for(let key of item.keys){
                    let offsetValue = item.offset[key];
                    if(offsetValue!=undefined) {
                        b[key] = a[key] + offsetValue
                    }
                    let bn = b.asArray().join('')
                    b.bName = bn;
                }
            } else {
                for(let key of item.keys){
                    let offsetValue = item.offset[key];
                    if(offsetValue!=undefined) {
                        a[key] = b[key] - offsetValue
                    }

                    let an = a.asArray().join('')
                    a.aName = an;
                }
            }
        })
    }
}


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let a = this.a = new Point({x:200,y:200, radius: 100})
        let b = this.b = new Point({x:300,y:300, radius: 100})
        let c = this.c = new Point({x:100,y:100, rotation: 0, radius: 20})

        this.dragging.add(a, b, c)

        let d = this.coupling = new Coupling()

        // d.couple(a, b, c, ['y', 'x'])
        d.couple(a, b, [100, 100])
    }

    draw(ctx){
        this.clear(ctx)
        this.coupling.step()
        let a = this.a;
        let b = this.b;
        // let b = this.linePoint;
        a.pen.indicator(ctx)
        b.pen.indicator(ctx, {color:'green'})
        this.c.pen.indicator(ctx)
    }
}


;stage = MainStage.go();