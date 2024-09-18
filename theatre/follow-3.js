// Assuming you have some Point class with x, y, vx, vy properties
// And mouse.position gives you the current mouse position

const notGreatStep = function(followPoint, mouse) {
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

        // Calculate the velocity component along the direction of the string (radial velocity)
        let radialVelocity = followPoint.vx * dx + followPoint.vy * dy;

        // Calculate the tangential velocity component (perpendicular to the string)
        let tangentVx = followPoint.vx - radialVelocity * dx;
        let tangentVy = followPoint.vy - radialVelocity * dy;

        // Maintain the tangential velocity to allow for spinning around the mouse
        followPoint.vx = tangentVx;
        followPoint.vy = tangentVy;
    }

    // Apply damping continuously to smooth the motion
    followPoint.vx *= damping;
    followPoint.vy *= damping;
};


// var gravity = -0.05; // Gravity constant for helium balloon.
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

    // If the distance is greater than the string length, calculate the force to pull the follow point back
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



const heavyStep = function(followPoint, mouse) {
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

        // Adjust the velocity so that it reflects the string tension
        let dotProduct = (followPoint.vx * dx + followPoint.vy * dy) * 2;
        followPoint.vx -= dotProduct * dx;
        followPoint.vy -= dotProduct * dy;

    }
    // Apply damping continuously to smooth the motion
    followPoint.vx *= damping;
    followPoint.vy *= damping;
};


class MainStage extends Stage {
    canvas = 'canvas'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0
        this.a = new Point({ x: 100, y: 100, vx: 0, vy: 0})

    }

    draw(ctx) {
        this.clear(ctx)
        // heavyStep(this.a, this.mouse.position)
        // noodleStringStep(this.a, this.mouse.position)
        springyString(this.a, this.mouse.position)
        this.a.pen.indicator(ctx)
        // this.a.x += 1
        // console.log(this.mouse.position.as.array())
    }
}

const stage = MainStage.go()
