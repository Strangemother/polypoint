
class PointListGradient {

    constructor(parent) {
        this.parent = parent;
    }

    linear(ctx) {
        /* use the points to generate a gradient.

        1. from start to end points
        2. each position must contain a 'color'
        3. Distance to each stop between 0/1
        */

        let parent = this.parent;
        let prev = parent[0]

        let distances = [[0, prev.color]];
        let total = 0;
        let round = Math.round;

        for (var i = 1; i < parent.length; i++) {
            let distance = round(parent[i].distanceTo(prev))
            distances.push([distance, prev.color])
            total += distance
            prev = parent[i]
        };

        let stops = []
        let running = 0
        for (var i = 0; i < distances.length; i++) {
            let v = distances[i]
            let dis = v[0]
            let r = (dis / total)
            let stop = Number((r + running).toFixed(4))
            stops.push([stop, v[1]])
            running += r
        }

        let a = parent[0]
        let b = parent.last()
        let gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        for (var i = 0; i < stops.length; i++) {
            let stop = stops[i]
            gradient.addColorStop(stop[0], stop[1]);
        }
        return gradient;
    }
}


Polypoint.head.install(PointListGradient)
