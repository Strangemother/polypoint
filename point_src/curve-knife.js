
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


function subdivideCubicBezier(P0, cP1, cP2, P3, t) {
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


const findNearestPoint = function(bezierStack, p, divisor=100) {
    // Example usage:
    // const t = 0.5; // subdivide at halfway
    // const { left, right } = subdivideCubicBezier(P0, P1, P2, P3, t);

    // console.log("Left subdivided curve:", left);
    // console.log("Right subdivided curve:", right);

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



Polypoint.head.installFunctions('BezierCurve', {
    nearestPoint(other, divisor=100) {
        let cps = this.getControlPoints()
        const stack = {
            line: this
            , controlPoints: {a: cps[0], b: cps[1]}
        };
        return findNearestPoint(stack, other, divisor)
    }

    , splitAt(t) {

        let l = this
        let cps = this.getControlPoints()
        let v = subdivideCubicBezier(
                  l.a.copy()
                , cps[0]
                , cps[1]
                , l.b.copy()
                , t)

        // console.log(v)

        this.lineA = this._makeLine(v.left)
        this.lineB = this._makeLine(v.right)
        return [
            this.lineA
            , this.lineB
        ];
    }

    , _makeLine(lA) {
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
});
