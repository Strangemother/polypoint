
// Function to convert angle to velocity vector
function angleToVelocity(theta, speed) {
  return {
    x: speed * Math.cos(theta),
    y: speed * Math.sin(theta)
  };
}

class MainStage extends Stage {
    canvas = 'canvas'
    mounted() {
        console.log('mounted')
        this.mouse.point.vy = this.mouse.point.vx = 0
        this.mouse.point.mass = 2000
        this.mouse.point.av = -20

        this.a = new Point({ x: 200, y: 300, av: .1, vx: 1, vy: 0, radius: 40, mass: 200 })
        this.b = new Point({ x: 500, y: 300, av: -.5, vx: .3, vy: 0, radius: 40, mass: 2000 })

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
        let mp = this.mouse.point
        mp.rotation += mp.av

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


class ReflectMainStage extends Stage {
    canvas = 'canvas'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0

        this.a = new Point({ x: 200, y: 230, av: 100,  vx: 1, vy: 0, radius: 10, mass: 20 })
        this.b = new Point({ x: 600, y: 400, av: -10,  vx: 0, vy: 0, radius: 200, mass: 120 })

        this.a.update({ radius: 10 })
        this.rotationSpeed = -130
        this.power = 0
        this.powerDown = false
    }

    addMotion(point) {
        /* Update the position of the point based on its velocity */
        point.x += point.vx
        point.y += point.vy
    }

    updatePoints() {
        let a = this.a
            , b = this.b
            ;
        a.rotation += a.av
        b.rotation += b.av
        // this.rotationSpeed *= .99
        this.addMotion(a)
        this.addMotion(b)
    }

    handleCollision() {
        let a = this.a;
        let b = this.b;

        // Calculate the distance between the two points
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Check for collision
        if (distance < a.radius + b.radius) {
            // Collision detected

            // Normal vector (unit vector from a to b)
            let nx = dx / distance;
            let ny = dy / distance;

            // Tangent vector (perpendicular to normal)
            let tx = -ny;
            let ty = nx;

            // Dot product of velocity and normal/tangent vectors
            let v1n = a.vx * nx + a.vy * ny;
            let v1t = a.vx * tx + a.vy * ty;
            let v2n = b.vx * nx + b.vy * ny;
            let v2t = b.vx * tx + b.vy * ty;

            // Masses
            let m1 = a.mass;
            let m2 = b.mass;

            // Compute new normal velocities (1D elastic collision equations)
            let v1n_prime = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
            let v2n_prime = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

            // Update velocities
            a.vx = v1n_prime * nx + v1t * tx;
            a.vy = v1n_prime * ny + v1t * ty;
            b.vx = v2n_prime * nx + v2t * tx;
            b.vy = v2n_prime * ny + v2t * ty;

            // Adjust positions to prevent overlap
            let overlap = 0.5 * (a.radius + b.radius - distance + 1);
            a.x -= overlap * nx;
            a.y -= overlap * ny;
            b.x += overlap * nx;
            b.y += overlap * ny;
        }
    }

    draw(ctx) {
        this.clear(ctx)
        this.updatePoints()
        this.handleCollision()

        // Update position of point b if it has velocity
        this.addMotion(this.b)

        this.a.pen.indicator(ctx)
        this.b.pen.indicator(ctx)
    }
}

class WorkingMainStage extends Stage {
    canvas = 'canvas'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0

        this.a = new Point({ x: 200, y: 230, vx: 1, vy: 0, radius: 10, mass: 20})
        this.b = new Point({ x: 600, y: 400, radius: 200, vx: 0, vy: 0, mass: 10})

        this.a.update({radius: 10})
        this.rotationSpeed = 0
        this.power = 0
        this.powerDown = false
    }

    addMotion(point, speed=1) {
        /* Because we're in a zero-gravity space, the velocity is simply _added_
        to the current XY, pushing the point in the direction of forced. */
        point.x += point.vx
        point.y += point.vy
        return
    }

    updatePointA(){
        let a = this.a;
        a.rotation += this.rotationSpeed
        this.rotationSpeed *= .99
        /* We could constantly push here - however without motion dampening
        it's likely you'll always drift
        (in the direction of radians - like a leaky engine) */
        // this.impart(this.power)
        this.addMotion(a, this.speed)

    }

    draw(ctx) {
        this.clear(ctx)
        this.updatePointA()

        this.a.pen.indicator(ctx)
        this.b.pen.indicator(ctx)
    }
}

const stage = MainStage.go()
