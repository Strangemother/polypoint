
class CollisionBox {
    /*
    collisionBox = new CollisionBox(points)
    collisionBox.shuffle()
    */
    constructor(points) {
        this.points = points || new PointList;
    }

    step(target) {
        this.shuffle(target, this.points);
    }

    shuffle(target, points=this.points) {
        const iterations=5;

        for (let k = 0; k < iterations; k++) {
            if(target) {
                points.forEach((p) => {
                    this.resolveCollision(target, p, true, false);
                });
            }

            for (let i = 0; i < points.length; i++) {
                let p1 = points[i];
                for (let j = i + 1; j < points.length; j++) {
                    let p2 = points[j];
                    this.resolveCollision(p1, p2);
                }
            }
        }
    }

    resolveCollision(p1, p2, p1Static = false, p2Static = false) {
          let dx = p2.x - p1.x;
          let dy = p2.y - p1.y;
          p2Static = p2.locked == true
          p1Static = p1.locked == true
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

}


