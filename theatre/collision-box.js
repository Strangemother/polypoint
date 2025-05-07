/*
categories: collisions
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
    ../point_src/pointlistpen.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/relative.js
    ../point_src/automouse.js

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted() {
        this.points1 = PointList.generate.grid(100, 10, 40);
        this.points1.each.radius = 20;

        this.points2 = PointList.generate.grid(100, 10, 40, {x:620, y: 240});
        // this.points2.each.radius = (p)=> 5+random.int(20)
        this.points2.forEach((p)=>p.radius=5+random.int(20))

        this.points = this.points1.concat(this.points2)
        this.dragging.add(...this.points);
    }

    draw(ctx) {
        this.clear(ctx);

        let mouse = this.mouse.point;
        let radius = 20
        mouse.radius = radius
        mouse.pen.indicator(ctx);

        // this.shuffle(radius, this.points);
        this.shuffle(radius, this.points);

        this.points.pen.indicators(ctx);
        // this.points2.pen.indicators(ctx);
    }


    shuffle(radius, points=this.points) {
        const iterations = 5;
        let mouse = this.mouse.point;

        for (let k = 0; k < iterations; k++) {
            points.forEach((p) => {
                resolveCollision(mouse, p, true, false);
            });

            for (let i = 0; i < points.length; i++) {
                let p1 = points[i];
                for (let j = i + 1; j < points.length; j++) {
                    let p2 = points[j];
                    resolveCollision(p1, p2);
                }
            }
        }
    }

}

// Collision resolution function
function resolveCollision(p1, p2, p1Static = false, p2Static = false) {
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dist = Math.hypot(dx, dy);
      let overlap = p1.radius + p2.radius - dist;

    if (overlap > 0) {
        let nx = dx / dist;
        let ny = dy / dist;

        let totalMass = (p1Static ? 0 : 1) + (p2Static ? 0 : 1);
        let p1Move = p1Static ? 0 : overlap / totalMass;
        let p2Move = p2Static ? 0 : overlap / totalMass;

        p1.x -= nx * p1Move;
        p1.y -= ny * p1Move;
        p2.x += nx * p2Move;
        p2.y += ny * p2Move;
    }
}


stage = MainStage.go()
