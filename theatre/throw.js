/*
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
    ../point_src/relative.js
    ../point_src/keyboard.js
    ../point_src/automouse.js
---

 */
// Function to convert angle to velocity vector
function angleToVelocity(theta, speed) {
  return {
    x: speed * Math.cos(theta),
    y: speed * Math.sin(theta)
  };
}

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.a = new Point({ x: 200, y: 300, av: .1, vx: 1, vy: 0
                            , radius: 40, mass: 20 })
        this.b = new Point({ x: 500, y: 300, av: -.1, vx: .3, vy: 0
                            , radius: 40, mass: 20 })

        this.rotationMultiplier = 30//1-this.clock.delta
        this.friction = 4
        this.bounce = 0
    }

    addMotion(point) {
        /* Update the position of the point based on its velocity */
        point.x += point.vx
        point.y += point.vy
    }

    updatePoints(a,b) {
        a.rotation += a.av * this.rotationMultiplier
        b.rotation -= b.av * this.rotationMultiplier
        this.addMotion(a)
        this.addMotion(b)
    }

    draw(ctx) {
        this.clear(ctx)

        this.handleCollision(this.a, this.b, this.friction, this.bounce)
        this.updatePoints(this.a,this.b)

        // let mp = this.mouse.point
        // this.handleCollision(mp, this.b)

        this.a.pen.indicator(ctx)
        this.b.pen.indicator(ctx)
        // mp.pen.indicator(ctx)
    }

    handleCollision(a,b, mu=1, e=1) {

        // Coefficient of restitution (e)
        // let e = 0 // Perfectly elastic collision

        // Friction calculations
        // let mu = 100; // Coefficient of friction

        // Calculate the distance between the two points
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Check for collision
        if (distance > a.radius + b.radius) {
            return
        }
        // Collision detected

        // Normal vector (unit vector from a to b)
        let nx = dx / distance;
        let ny = dy / distance;

        // Tangent vector (perpendicular to normal)
        let tx = -ny;
        let ty = nx;

        // Moments of inertia (I = 0.5 * m * r^2 for solid disks)
        let m1 = a.mass;
        let m2 = b.mass;
        let r1 = a.radius;
        let r2 = b.radius;
        let I1 = 0.5 * m1 * r1 * r1;
        let I2 = 0.5 * m2 * r2 * r2;

        // Velocities at point of contact due to rotation
        let v_arx = -a.av * a.radius * ny;
        let v_ary = a.av * a.radius * nx;

        let v_brx = -b.av * b.radius * ny;
        let v_bry = b.av * b.radius * nx;

        // Total velocities at point of contact
        let v_ax_total = a.vx + v_arx;
        let v_ay_total = a.vy + v_ary;

        let v_bx_total = b.vx + v_brx;
        let v_by_total = b.vy + v_bry;

        // Relative velocity at point of contact
        let vrx = v_ax_total - v_bx_total;
        let vry = v_ay_total - v_by_total;

        // Relative normal and tangential velocities
        let v_rel_normal = vrx * nx + vry * ny;
        let v_rel_tangent = vrx * tx + vry * ty;

        // Normal impulse scalar
        let jn_denom = 1 / m1 + 1 / m2;
        let jn = -(1 + e) * v_rel_normal / jn_denom;

        // Tangential impulse scalar
        let jt_denom = 1 / m1 + 1 / m2 + (r1 * r1) / I1 + (r2 * r2) / I2;
        let jt = -v_rel_tangent / jt_denom;

        // Limit jt to Coulomb's law of friction
        let jt_max = mu * Math.abs(jn);
        if (jt > jt_max) jt = jt_max;
        if (jt < -jt_max) jt = -jt_max;

        // Impulse components
        let impulse_nx = jn * nx;
        let impulse_ny = jn * ny;
        let impulse_tx = jt * tx;
        let impulse_ty = jt * ty;

        // Update linear velocities
        a.vx += (impulse_nx + impulse_tx) / m1;
        a.vy += (impulse_ny + impulse_ty) / m1;

        b.vx -= (impulse_nx + impulse_tx) / m2;
        b.vy -= (impulse_ny + impulse_ty) / m2;

        // Update angular velocities
        a.av += (jt * r1) / I1;
        b.av -= (jt * r2) / I2;

        // Adjust positions to prevent overlap
        let overlap = 0.5 * (a.radius + b.radius - distance + 1);
        a.x -= overlap * nx;
        a.y -= overlap * ny;
        b.x += overlap * nx;
        b.y += overlap * ny;
    }

}


const stage = MainStage.go()
