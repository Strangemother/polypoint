/*

src_dir: ../point_src/
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
    ../point_src/automouse.js
    ../point_src/functions/rel.js
    dragging

 */

// var gravity = {x: 0, y:-0.05}; // Gravity constant for helium balloon.
var gravity = {x: 0, y:0.95}; // Gravity constant

var stringLength = 200; // The length of the "string"
var damping = 0.98; // Damping to reduce energy over time

// Variables to store the previous mouse position
let prevMouseX = 0//mouse.x;
let prevMouseY = 0//mouse.y;

const stepBadUpperArc = function(followPoint, mouse) {
    // Calculate the mouse velocity based on the change in position
    mouseVx = mouse.x - prevMouseX;
    mouseVy = mouse.y - prevMouseY;

    // Update the previous mouse position for the next frame
    prevMouseX = mouse.x;
    prevMouseY = mouse.y;

    // Apply gravity to the follow point's vertical velocity
    followPoint.vy += gravity;

    // Update the follow point's position based on its velocity
    followPoint.x += followPoint.vx;
    followPoint.y += followPoint.vy;

    // Calculate the vector from the mouse to the follow point
    let dx = followPoint.x - mouse.x;
    let dy = followPoint.y - mouse.y;

    // Calculate the current distance between the follow point and the mouse
    let distance = Math.sqrt(dx * dx + dy * dy);

    // If the distance exceeds the string length, we need to constrain the follow point
    if (distance > stringLength) {
        // Normalize the direction vector
        dx /= distance;
        dy /= distance;

        // Set the follow point's position to be exactly on the circumference of the string length
        followPoint.x = mouse.x + dx * stringLength;
        followPoint.y = mouse.y + dy * stringLength;

        // Calculate the radial velocity (velocity along the string)
        let radialVelocity = followPoint.vx * dx + followPoint.vy * dy;

        // Calculate the tangential velocity component (perpendicular to the string)
        let tangentVx = followPoint.vx - radialVelocity * dx;
        let tangentVy = followPoint.vy - radialVelocity * dy;

        // Project mouse velocity onto the tangent vector
        let mouseInfluence = ((mouseVx * -dy + mouseVy * dx) / distance) * 20;

        // Modify the tangential velocity based on the direction of the mouse pull
        let mouseTangentInfluence = (mouseVx * -dy + mouseVy * dx) / Math.sqrt(dx * dx + dy * dy);
        if (mouseTangentInfluence > 0) {
            // If pulling in the direction of the tangent, amplify the influence
            tangentVx += mouseInfluence * -dy;
            tangentVy += mouseInfluence * dx;
        }

        // Update the follow point's velocity
        followPoint.vx = tangentVx;
        followPoint.vy = tangentVy;
    }

    // Apply damping continuously to smooth the motion
    followPoint.vx *= damping;
    followPoint.vy *= damping;
};


const noodleStringStep = function(followPoint, mouse) {
    // Calculate the mouse velocity based on the change in position
    mouseVx = mouse.x - prevMouseX;
    mouseVy = mouse.y - prevMouseY;

    // Update the previous mouse position for the next frame
    prevMouseX = mouse.x;
    prevMouseY = mouse.y;

    // Apply gravity to the follow point's vertical velocity
    followPoint.vy += gravity.y;
    followPoint.vx += gravity.x;

    // Update the follow point's position based on its velocity
    followPoint.x += followPoint.vx;
    followPoint.y += followPoint.vy;

    // Calculate the vector from the mouse to the follow point
    let dx = followPoint.x - mouse.x;
    let dy = followPoint.y - mouse.y;

    // Calculate the current distance between the follow point and the mouse
    let distance = Math.sqrt(dx * dx + dy * dy);

    // If the distance exceeds the string length, we need to constrain the follow point
    if (distance > stringLength) {
        // Normalize the direction vector
        dx /= distance;
        dy /= distance;

        // Set the follow point's position to be exactly on the circumference of the string length
        followPoint.x = mouse.x + dx * stringLength;
        followPoint.y = mouse.y + dy * stringLength;

        // Calculate the radial velocity (velocity along the string)
        let radialVelocity = followPoint.vx * dx + followPoint.vy * dy;

        // Calculate the tangential velocity component (perpendicular to the string)
        let tangentVx = followPoint.vx - radialVelocity * dx;
        let tangentVy = followPoint.vy - radialVelocity * dy;

        // Project mouse velocity onto the tangent vector
        let mouseInfluence = (mouseVx * -dy + mouseVy * dx) / distance;

        // Add this influence to the tangential velocity
        tangentVx += mouseInfluence * -dy;
        tangentVy += mouseInfluence * dx;

        // Update the follow point's velocity
        followPoint.vx = tangentVx;
        followPoint.vy = tangentVy;
    }

    // Apply damping continuously to smooth the motion
    followPoint.vx *= damping;
    followPoint.vy *= damping;
};


const springyString = function(followPoint, mouse){
    // Calculate the vector from the follow point to the mouse
    let dx = mouse.x - followPoint.x;
    let dy = mouse.y - followPoint.y;

    // Calculate the distance from the follow point to the mouse
    let distance = Math.sqrt(dx * dx + dy * dy);

    // If the distance is greater than the string length,
    // calculate the force to pull the follow point back
    if (distance > stringLength) {
        // Normalize the direction vector
        dx /= distance;
        dy /= distance;

        // Apply a force that pulls the follow point toward the mouse
        const force = (distance - stringLength) * 0.1; // Tweak this factor as needed

        // Update the follow point's velocity
        followPoint.vx += force * dx;
        followPoint.vy += force * dy;
    }

    // Apply gravity
    followPoint.vy += gravity.y;
    followPoint.vx += gravity.x;

    // Update the follow point's position based on its velocity
    followPoint.x += followPoint.vx;
    followPoint.y += followPoint.vy;

    if(followPoint.isNaN()) {
        console.warn('isNaN applied')
        followPoint.x = followPoint.y = 1
    }

    // Apply damping to simulate energy loss over time
    followPoint.vx *= damping;
    followPoint.vy *= damping;
};


const heavyStep = function(followPoint, mouse, gravity, damping=.9, dotDamping=.2, forceMultiplier=.1) {
    // Apply gravity to the follow point's vertical velocity
    // Calculate the vector from the mouse to the follow point
    // let dx = followPoint.x - mouse.x ;
    // let dy = followPoint.y - mouse.y ;
    let dx = mouse.x - followPoint.x;
    let dy = mouse.y - followPoint.y;

    // Calculate the current distance between the follow point and the mouse
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Set the follow point's position to be exactly on the circumference of the string length
    // const force = (distance - stringLength) * 0.01; // Tweak this factor as needed

    // If the distance exceeds the string length, we need to constrain the follow point
    if (distance > stringLength) {
        // Normalize the direction vector
        dx /= distance;
        dy /= distance;


        if(dotDamping!==false) {
            // Adjust the velocity so that it reflects the string tension
            let dotProduct = (followPoint.vx * dx + followPoint.vy * dy) * dotDamping;
            followPoint.vx -= dotProduct * dx;
            followPoint.vy -= dotProduct * dy;
        }

        if(forceMultiplier!==false){
            const force = (distance - stringLength) * forceMultiplier; // Tweak this factor as needed
            followPoint.vx += force * dx;
            followPoint.vy += force * dy;
        }

    }

    // Apply gravity
    if(gravity){
        followPoint.vy += gravity.y;
        followPoint.vx += gravity.x;
    }

    // Update the follow point's position based on its velocity
    followPoint.x += followPoint.vx;
    followPoint.y += followPoint.vy;

    if(damping) {
        // Apply damping continuously to smooth the motion
        followPoint.vx *= damping;
        followPoint.vy *= damping;
    }
};


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0

        this.pins = (new PointList(
                  { x: 200, y: 100, vx: 0, vy: 0}
                , { x: 400, y: 100, vx: 0, vy: 0}
                , { x: 600, y: 100, vx: 0, vy: 0}
                , { x: 800, y: 100, vx: 0, vy: 0}

                , { x: 200, y: 400, vx: 0, vy: 0}
                , { x: 400, y: 400, vx: 0, vy: 0}
                , { x: 600, y: 400, vx: 0, vy: 0}
                , { x: 800, y: 400, vx: 0, vy: 0}
            )).cast()

        this.points = (new PointList(
                 { x: 300, y: 100, vx: 0, vy: 0}
                , { x: 500, y: 100, vx: 0, vy: 0}
                , { x: 700, y: 100, vx: 0, vy: 0}
                , { x: 900, y: 100, vx: 0, vy: 0}

                , { x: 300, y: 500, vx: 0, vy: 0}
                , { x: 500, y: 500, vx: 0, vy: 0}
                , { x: 700, y: 500, vx: 0, vy: 0}
                , { x: 900, y: 500, vx: 0, vy: 0}
            )).cast()

        this.dragging.add(...this.pins)
    }

    draw(ctx) {
        this.clear(ctx);

        let [pins, points] = [this.pins, this.points]

        let drawSet = function(index, func) {
            func(points[index], pins[index])
            pins[index].pen.circle(ctx, {color:'red'})
            points[index].pen.indicator(ctx)
        }

        let funcs = [
              (p, pin) => springyString(p, pin)
            , (p, pin) => heavyStep(p, pin, gravity, .99)
            , (p, pin) => heavyStep(p, pin, gravity, .98, false, .1)
            , (p, pin) => heavyStep(p, pin, gravity, .99, false)
            , (p, pin) => heavyStep(p, pin, gravity, false, 1)
        ]
        funcs.forEach((f, i)=> drawSet(i, f))
        // // noodleStringStep(this.a, this.mouse.position)

        // this.a.x += 1
        // console.log(this.mouse.position.as.array())
    }
}

const stage = MainStage.go()
