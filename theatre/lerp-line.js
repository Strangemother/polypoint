/*
    ---
    title: Lerpy Lerpy Lerpingson
    files:
        ../point_src/core/head.js
        ../point_src/pointpen.js
        ../point_src/pointdraw.js
        ../point_src/extras.js
        ../point_src/math.js
        ../point_src/point-content.js
        ../point_src/stage.js
        ../point_src/point.js
        ../point_src/distances.js
        ../point_src/pointlist.js
        ../point_src/events.js
        ../point_src/functions/clamp.js
        ../point_src/curve-extras.js
        ../point_src/random.js
        ../point_src/dragging.js
        ../point_src/setunset.js
        ../point_src/stroke.js
        ../point_src/functions/within.js
        ../point_src/automouse.js
    ---

    # Line LERP

    Lerp a point along a straight line
*/

/*
    ---
    title: Lerpy Lerpy Lerpingson
    layout: post
    published-on: 1 January 2000
    tags:
        Line, Lerp, other
    related:
        lerp-curve-lines
    imports:
        lerp-line.html
    files:
        ../literal/path.js
    ---

    markdown content
*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.indicator = new Point({x: 300, y: 300}); // Start the draggable point somewhere
        this.a = new Point({x: 100, y: 100});
        this.b = new Point({x: 500, y: 500});

        this.dragging.add(this.a, this.b)
        this.line = new Line(this.a, this.b);

        this.stroke = new Stroke({
            color: '#eee',
            width: 1,
            dash: [7, 4]
        });

        this.events.wake();
    }

    onMousemove(ev) {
        let p = this.mouse.point;
        // let f = this.findNearestPoint(this.line, p)
        let f = this.line.findNearestPoint(p)

        // Update the draggable point to the projection on the line
        this.indicator.set(f)
        // this.indicator.x = f.x;
        // this.indicator.y = f.y;
    }

    draw(ctx) {
        this.clear(ctx);

        // Draw the line
        this.stroke.set(ctx);
        this.line.render(ctx, { color: '#90000' });
        this.stroke.unset(ctx);

        // Draw the draggable point along the line
        this.indicator?.pen.fill(ctx, 'green');
    }
};



const findNearestPoint = function(line, point) {
    /* Find the point along the line of which is _closest_ to the given
    point. */

    let b = line.b
    let a = line.a
    let p = point
    // Project p onto the line formed by points a and b
    let ab = { x: b.x - a.x, y: b.y - a.y };
    let ap = { x: p.x - a.x, y: p.y - a.y };
    let abLengthSq = ab.x * ab.x + ab.y * ab.y;
    let t = (ap.x * ab.x + ap.y * ab.y) / abLengthSq; // Projection factor

    // Clamp t between 0 and 1 to restrict within line segment
    t = Math.max(0, Math.min(1, t));

    // Update the draggable point to the projection on the line
    return {
        x: a.x + t * ab.x
        , y: a.y + t * ab.y
    }
}

Polypoint.head.installFunctions('Line', {
    findNearestPoint(point){
        /* Find the point along the line of which is _closest_ to the given
        point. */
        let localCache = this._nearestPoint
        if(!localCache) {
            localCache = this._nearestPoint = new Point
        }

        localCache.set(findNearestPoint(this, point))

        return localCache
    }
})


;stage = MainStage.go();
