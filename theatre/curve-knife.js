/*
files:
    ../point_src/math.js
    head
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/pointlist.js
    mouse
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    dragging
    stroke
    ../point_src/curve-extras.js
---

*/

/**
 * Linearly interpolate between two points a and b at parameter t
 * Returns a new point { x, y }
 */
function lerp(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  };
}

/**
 * Subdivide a cubic Bézier at parameter t using De Casteljau’s algorithm.
 * @param {Object} P0 - Starting control point {x, y}
 * @param {Object} P1 - 1st control point {x, y}
 * @param {Object} P2 - 2nd control point {x, y}
 * @param {Object} P3 - Ending control point {x, y}
 * @param {number} t - Split parameter, 0 < t < 1
 * @returns {Object} An object with two arrays:
 *                    left:  [P0, A, D, F]
 *                    right: [F, E, C, P3]
 */
function subdivideCubicBezier(P0, cP1, cP2, P3, t) {
  // Step 1: interpolate P0->P1, P1->P2, P2->P3
  const A = lerp(P0, cP1, t);
  const B = lerp(cP1, cP2, t);
  const C = lerp(cP2, P3, t);

  // Step 2: interpolate A->B, B->C
  const D = lerp(A, B, t);
  const E = lerp(B, C, t);

  // Step 3: final interpolation between D->E
  const F = lerp(D, E, t);

  // Return two new sets of control points
  return {
    left:  [P0, A, D, F]
    , right: [F, E, C, P3]
    , t
  };
}

// Example usage:
// const t = 0.5; // subdivide at halfway
// const { left, right } = subdivideCubicBezier(P0, P1, P2, P3, t);

// console.log("Left subdivided curve:", left);
// console.log("Right subdivided curve:", right);



const findNearestPoint = function(bezierStack, p, divisor=100) {

    let minDist = Infinity;
    let closestPoint = null;

    let pointA = bezierStack.line.a
    let pointB = bezierStack.line.b
    let controlPointA = bezierStack.controlPoints.a
    let controlPointB = bezierStack.controlPoints.b

    // Sample points along the Bezier curve
    for (let i = 0; i <= divisor; i++) {
        let t = i / divisor;
        let oneMt = 1 - t;
        let omtp3 = Math.pow(oneMt, 3)
        let tpow3 = Math.pow(t, 3)
        let tpow2 = Math.pow(t, 2)
        let omtp2 = Math.pow(oneMt, 2)

        // Calculate the point on the cubic Bezier curve at parameter t
        let x = omtp3 * pointA.x + 3
                * omtp2 * t * controlPointA.x + 3
                * (oneMt) * tpow2 * controlPointB.x
                + tpow3 * pointB.x
                ;

        let y = omtp3 * pointA.y + 3
                * omtp2 * t * controlPointA.y + 3
                * (oneMt) * tpow2 * controlPointB.y
                + tpow3 * pointB.y
                ;

        let dx = p.x - x;
        let dy = p.y - y;
        let distSq = dx * dx + dy * dy;

        if (distSq < minDist) {
            minDist = distSq;
            closestPoint = { x: x, y: y, t:t };
        }
    }

    return closestPoint
}


const dcopy = function(p){
    let r = (new Point).update({
          x: p.x
        , y: p.y
        , radius: p.radius
        , rotation: p.rotation
    })
    return r;
}

class MainStage extends Stage {
    canvas='playspace'
    live = true
    mounted(){
        this.pointA = new Point(150, 150, 100, 120)
        this.pointB = new Point(300, 400, 100) // default rotation == 0 (looking right)
        this.line = new BezierCurve(this.pointA, this.pointB)
        this.controlPointA = this.pointA.project()
        this.controlPointB = this.pointB.project()

        this.dragging.add(this.pointB, this.pointA,
                        this.controlPointA, this.controlPointB)

        this.controlPointA.onDragMove = this.updatePointsToControl.bind(this)
        this.controlPointB.onDragMove = this.updatePointsToControl.bind(this)

        this.lineStroke = new Stroke({
            color: 'green'
            , width: 2
            , dash: [7, 4]
        })

        this.lineStroke2 = new Stroke({
            color: 'red'
            , width: 2
            // , dash: [7, 4]
        })

        this.indicator = new Point(344,344)
        // this.events.wake()
        this.dragging.onLongClick = this.onLongClick.bind(this)
    }

    onMousemove(ev) {
        let p = this.mouse.position;

        const stack ={
            line: this.line
            , controlPoints: {
                a: this.controlPointA
                , b: this.controlPointB
            }
        };

        const closestPoint = findNearestPoint(stack, p)

        this.indicator.set(closestPoint);
        // this.indicator.x = closestPoint.x; this.indicator.y = closestPoint.y;
    }

    onLongClick(stage, canvas, ev, delta) {
        this.dragging.callPointHandler('onLongClick', ev, this._near, delta)

        let cutPoint = this.indicator.t
        console.log('Long Click', cutPoint)
        this._splitLines = this.splitAt(cutPoint)
    }

    splitAt(t) {
        let v = subdivideCubicBezier(
                  dcopy(this.pointA)
                , dcopy(this.controlPointA)
                , dcopy(this.controlPointB)
                , dcopy(this.pointB)
                , t)

        console.log(v)

        this.lineA = this.makeLine(v.left)
        this.lineB = this.makeLine(v.right)
        return v;
    }

    makeLine(lA) {
        let a = new Point(lA[0])
        let c1 = new Point(lA[1])
        let c2 = new Point(lA[2])
        let b = new Point(lA[3])

        a.lookAt(c1)
        b.lookAt(c2)

        a.radius = a.distanceTo(c1)
        b.radius = b.distanceTo(c2)

        return {line: new BezierCurve(a,b,), controls: [c1, c2]}
    }

    updatePointsToControl(){
        this.pointA.lookAt(this.controlPointA)
        this.pointB.lookAt(this.controlPointB)
        this.pointA.radius = this.pointA.distanceTo(this.controlPointA)
        this.pointB.radius = this.pointB.distanceTo(this.controlPointB)
    }

    draw(ctx){
        this.clear(ctx)

        this.indicator?.pen.fill(ctx, '#ddd')

        // show the spare points
        this.pointB.pen.indicator(ctx, {color:'#333'})
        this.pointA.pen.indicator(ctx, {color:'#333'})


        // Nice bright control point for the bezier curve
        this.controlPointA.pen.fill(ctx, '#33DDAA')
        this.controlPointB.pen.fill(ctx, '#33DDAA')

        let lineStroke = this.lineStroke
        lineStroke.set(ctx)
        this.line.render(ctx)
        lineStroke.unset(ctx)

        if(this.lineA) {
            this.lineStroke2.set(ctx)
            this.lineA.controls.forEach((p, i)=>{

                let pos = this.lineA.line[i];
                let cpp = new Point(pos.x, pos.y)
                cpp.lookAt(p)
                cpp.radius = cpp.distanceTo(p)
                cpp.pen.line(ctx, p, '#999')
                p.pen.fill(ctx, {color:'orange'})
            })

            this.lineA.line.render(ctx, 'orange')

            // this.lineB.controls.forEach(p=>p.pen.fill(ctx, {color:'red'}))
            this.lineB.controls.forEach((p, i)=>{

                let pos = this.lineB.line[i];
                let cpp = new Point(pos.x, pos.y)
                cpp.lookAt(p)
                cpp.radius = cpp.distanceTo(p)
                cpp.pen.line(ctx, p, '#999')
                p.pen.fill(ctx, {color:'red'})
            })

            this.lineB.line.render(ctx, 'red')
            this.lineStroke2.unset(ctx)
        }
    }
}

;stage = MainStage.go();