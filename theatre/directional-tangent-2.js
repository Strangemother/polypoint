/*
---
title: Directional Tangent 2
categories: tangents
    bisector
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/tangents.js
    ../point_src/bisector.js
    ../point_src/math.js
    ../point_src/split.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
    ../point_src/tangents.js
    ../point_src/text/beta.js
---

Acute kite form, where a single item always points towards its acute angle.
*/

function triples(arr) {
    const triples = [];
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        triples.push([
            arr[i % len],
            arr[(i + 1) % len],
            arr[(i + 2) % len]
        ]);
    }
    return triples;
}

const isOuterPoint = function(a,b,c) {
    return calculateAngleWithRef(a,b,c) > 180
    // return obtuseBisect(previousPoint, p, nextPoint) > -1
}

class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.points = new PointList(
                {x:130, y:230, radius: 30}
                ,{x:300, y:240, radius: 30}
                // ,{x:230, y:340, radius: 30}
                ,{x:540, y:140, radius: 30}
                ,{x:440, y:440, radius: 30}
                ,{x:400, y:40, radius: 30}
            ).cast();
        this.regen();
        // stage.points.siblings(1).forEach(pair=>{})
        this.dragging.addPoints(...this.points)
    }

    regen() {
        this.twistAll(this.points)
        this.biPoints = this.generate(this.points)
        this.tangentPoints = this.generateTangents(this.biPoints)
    }

    generateTangents(biPoints) {
        /* Built tangent lines to later plot*/
        let res = []
        biPoints.siblings(1).forEach((pairs, i, items)=>{
            if(!this.points[i].isOuter) {
                if(i == 0) {
                    let io = this.points[i+1]?.isOuter
                    let fname = io? 'ba': 'aa'
                    res.push(pairs[0].tangent[fname](pairs[1]))
                    /*if(io) {
                        res.push(pairs[0].tangent[fname](pairs[1]))
                    }else{
                        // res.push(pairs[0].tangent.ab(pairs[1]))
                        res.push(pairs[0].tangent[fname](pairs[1]))
                    }
                    */
                } else if(i == items.length-1) {

                    if(this.points[i+1]?.isOuter) {
                        res.push(pairs[0].tangent.aa(pairs[1]))
                    }else{

                        /* Race condition*/
                        let next = this.points[i+1]
                        if(next == undefined) {
                            next = this.points[0] //wrap
                        }

                        let io = next?.isOuter
                        let fname = io? 'ba': 'aa'
                        res.push(pairs[0].tangent[fname](pairs[1]))

                        // if(next?.isOuter) {
                        //     res.push(pairs[0].tangent.ba(pairs[1]))
                        // } else {

                        //     res.push(pairs[0].tangent.aa(pairs[1]))
                        // }

                        // res.push(pairs[0].tangent.aa(pairs[1]))
                    }
                } else {
                    let io = this.points[i+1]?.isOuter
                    let fname = io? 'ba': 'aa'
                    res.push(pairs[0].tangent[fname](pairs[1]))

                    // if(this.points[i+1].isOuter) {
                    //     res.push(pairs[0].tangent.ba(pairs[1]))
                    // } else {
                    //     res.push(pairs[0].tangent.aa(pairs[1]))
                    // }
                }
            }else {
                if(i == 0) {
                    let io = this.points[i+1]?.isOuter
                    let fname = io? 'bb': 'ab'
                    res.push(pairs[0].tangent[fname](pairs[1]))

                    // if(this.points[i+1].isOuter) {
                    //     res.push(pairs[0].tangent.bb(pairs[1]))
                    // } else {
                    //     res.push(pairs[0].tangent.ab(pairs[1]))
                    // }

                } else if(i == items.length-1) {
                    if(this.points[i+1]?.isOuter) {
                        res.push(pairs[0].tangent.bb(pairs[1]))
                        // res.push(pairs[0].tangent.ab(pairs[1]))
                    } else {
                        /* race condition */
                        // i is outer i+1 not outer
                        let next = this.points[i+1]
                        if(next == undefined) {
                            next = this.points[0] //wrap
                        }

                        let io = next?.isOuter
                        let fname = io? 'bb': 'ab'
                        res.push(pairs[0].tangent[fname](pairs[1]))

                        /*if(next?.isOuter) {
                            res.push(pairs[0].tangent.bb(pairs[1]))
                        } else {
                            res.push(pairs[0].tangent.ab(pairs[1]))
                            // res.push(pairs[0].tangent.ab(pairs[1]))
                        }*/
                    }

                } else {
                    let io = this.points[i+1]?.isOuter
                    let fname = io? 'bb': 'ab'
                    res.push(pairs[0].tangent[fname](pairs[1]))

                    /*if(this.points[i+1].isOuter) {
                        res.push(pairs[0].tangent.bb(pairs[1]))
                    } else {
                        res.push(pairs[0].tangent.ab(pairs[1]))
                    }*/
                }
            }

            // res.push(b.tangent.outerLines(d).b)
        })

        return res;
    }

    generate(points) {
        // this.biPoints = this.generate(this.points)
        let res = new PointList;

        points.forEach(p=>{
            /* To only project the _inside_ pin for the loop.*/
            let pin = p.project()
            pin.radius = p.radius
            pin.color = p.isOuter? 'red': 'yellow'
            res.push(pin)

            /* Alternatively we can project two items,
            and work with inner or outer.
            let pins = p.split(2)
            pins.each.radius = p.radius

            if(p.isOuter) {
                pins[0].color = 'red'
                pins[1].color = 'yellow'
            }else {
                pins[0].color = 'yellow'
                pins[1].color = 'red'
                res.push(pins[0])
            }
            // res.push(pins)
            */

        })
        return res
    }

    twistAll(points) {
        // triples(this.points).forEach((t)=>{
        points.triples().forEach((t)=>{
            let outer = acuteBisect(t[0], t[1], t[2])
            let isOuter = isOuterPoint(t[0], t[1], t[2])
            t[1].radians = outer
            t[1].isOuter = isOuter
            t[1].color = isOuter? 'red': 'yellow'
        });
    }

    draw(ctx){
        this.clear(ctx)
        // this.biPoints.forEach(pair=>{
        //     pair.pen.indicator(ctx)
        // })
        this.regen()
        this.biPoints.pen.indicator(ctx)

        this.points.pen.indicator(ctx)
        // this.points.pen.line(ctx, {color:'green'})
        // this.points[0].pen.line(ctx, this.points.last())

        ctx.fillStyle = '#DDD'
        ctx.font = '400 22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        this.points.forEach((p, i)=>{

            p.text.fill(ctx, i)
        })

        this.tangentPoints.forEach(pair=>{
            let [a,b] = pair;
            new Point(a).pen.line(ctx, b)

            pair.forEach(p=>{
                new Point(p).pen.circle(ctx, {color:'#555'})
            })
        })
    }
}


;stage = MainStage.go();