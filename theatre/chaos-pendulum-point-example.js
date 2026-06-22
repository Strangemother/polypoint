/*
title: Pendulum Swing Physics
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/extras.js
    ../point_src/setunset.js
    ../point_src/stroke.js


 */
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
Point.mouse.listen(canvas)


const pendulum_main = function(){

    let rect = canvas.getBoundingClientRect()
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;

    setupPendulum()
    start(randomLine)
    draw(performance.now())
}

function draw(nowMs) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update(nowMs)
    if(randomLine) drawMyLine()
    requestAnimationFrame(draw)
}


var UC = 0
const FIXED_DT = 1 / 120;
const MAX_FRAME_DT = 1 / 20;
const INTERNAL_STEPS = 3;
var lastTimeSec = 0;
var accumulator = 0;

const update = function(nowMs) {
    UC++;
    const nowSec = nowMs * 0.001;

    if(lastTimeSec === 0) {
        lastTimeSec = nowSec;
    }

    const frameDt = Math.min(nowSec - lastTimeSec, MAX_FRAME_DT);
    lastTimeSec = nowSec;
    accumulator += frameDt;

    while(accumulator >= FIXED_DT) {
        solveLine(randomLine, FIXED_DT);
        accumulator -= FIXED_DT;
    }
}

var leftOffset;

var randomLine;
var length = 100;
var gravity = 2200;
var angularDamping = 0.9999;
var members = 5;            // anchor + bob1 + bob2 (double pendulum)
var anchorY = 180;
var randomStartMinDeg = -160;
var randomStartMaxDeg = 160;
var randomStartImpulse = 1.8;

// Core double-pendulum parameters.
var coreLength1 = 120;
var coreLength2 = 95;
var coreMass1 = 1.0;
var coreMass2 = 1.45;

// Extension parameters for points >= 3.
var tailLengthScale = 0.92;
var tailMassBase = 0.9;
var tailMassStep = 0.2;

var extensionMode = 'rigid'; // 'rigid' (arm-like) or 'rope' (constraint tail)
var extensionCoupling = 18;
var extensionRelativeDamping = 7;
var extensionAngularDamping = 0.9988;
var maxTailAngularAccel = 180;
var maxTailAngularSpeed = 16;
var tailDamping = 0.997;
var tailSolverIters = 8;
var dpState;

const segmentLengthAt = function(segmentIndex) {
    if(segmentIndex === 1) return coreLength1;
    if(segmentIndex === 2) return coreLength2;
    return coreLength2 * tailLengthScale;
}

const massAtPoint = function(pointIndex) {
    if(pointIndex === 0) return Infinity;
    if(pointIndex === 1) return coreMass1;
    if(pointIndex === 2) return coreMass2;
    return tailMassBase + (pointIndex - 3) * tailMassStep;
}

const shortestAngleDelta = function(target, current) {
    return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

const clamp = function(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

const setupPendulum = function (){
    leftOffset = canvas.width * .5;

    randomLine = PointList.generate.list(members, length)
    const minRad = randomStartMinDeg * Math.PI / 180;
    const maxRad = randomStartMaxDeg * Math.PI / 180;
    const theta1 = minRad + (Math.random() * (maxRad - minRad));
    const theta2 = minRad + (Math.random() * (maxRad - minRad));
    const l1 = segmentLengthAt(1);
    const l2 = segmentLengthAt(2);

    randomLine[0].x = leftOffset;
    randomLine[0].y = anchorY;

    randomLine[1].x = randomLine[0].x + l1 * Math.sin(theta1);
    randomLine[1].y = randomLine[0].y + l1 * Math.cos(theta1);
    randomLine[2].x = randomLine[1].x + l2 * Math.sin(theta2);
    randomLine[2].y = randomLine[1].y + l2 * Math.cos(theta2);

    for(let i = 3; i < randomLine.length; i++) {
        const segLen = segmentLengthAt(i);
        randomLine[i].x = randomLine[i - 1].x + segLen * Math.sin(theta2);
        randomLine[i].y = randomLine[i - 1].y + segLen * Math.cos(theta2);
    }

    for(let i = 0; i < randomLine.length; i++) {
        const p = randomLine[i];
        p.oldX = p.x;
        p.oldY = p.y;
        p.isDrag = false;
        p.mass = massAtPoint(i);
        p.invMass = Number.isFinite(p.mass) ? 1 / p.mass : 0;
    }

    for(let i = 3; i < randomLine.length; i++) {
        randomLine[i].oldX = randomLine[i].x + (Math.random() * 2 - 1) * randomStartImpulse * 0.35;
        randomLine[i].oldY = randomLine[i].y + (Math.random() * 2 - 1) * randomStartImpulse * 0.35;
    }

    dpState = {
        theta1,
        theta2,
        omega1: (Math.random() * 2 - 1) * randomStartImpulse,
        omega2: (Math.random() * 2 - 1) * randomStartImpulse,
        m1: massAtPoint(1),
        m2: massAtPoint(2),
        l1,
        l2,
        tailThetas: [],
        tailOmegas: [],
        tailLengths: [],
        tailMasses: []
    };

    for(let i = 3; i < randomLine.length; i++) {
        const tailTheta = theta2 + (Math.random() * 2 - 1) * 0.08;
        dpState.tailThetas.push(tailTheta);
        dpState.tailOmegas.push((Math.random() * 2 - 1) * randomStartImpulse * 0.45);
        dpState.tailLengths.push(segmentLengthAt(i));
        dpState.tailMasses.push(massAtPoint(i));
    }

    // randomLine[0].isDrag = true
    // randomLine[1].x -= 50;
    // randomLine[1].y -= 50;

    // randomLine[3].x -= 50;
    // randomLine[3].y -= 50;
    return randomLine;
}



function start(pointList) {

    var i = 0;
    var n = 0;
    //
    var point;
    var theta = -45 * Math.PI / 180;

    pointList[0].isDrag = true;

    for (i = 0; i < pointList.length; i++) {
        // addChild(point);
        let point = pointList[i]
        // point.x = point.x + length * Math.cos(theta);
        // point.y = point.y + length * Math.sin(theta);
    }

    // addEventListener(Event.ENTER_FRAME, enterFrameListener,false,0,false);
}


const solveLine = function(pointList, dt){
    if(!pointList || pointList.length < 3 || !dpState) {
        return;
    }

    const stepDt = dt / INTERNAL_STEPS;
    const s = dpState;

    for(let i = 0; i < INTERNAL_STEPS; i++) {
        const sin12 = Math.sin(s.theta1 - s.theta2);
        const cos12 = Math.cos(s.theta1 - s.theta2);
        const den = (2 * s.m1 + s.m2 - s.m2 * Math.cos(2 * s.theta1 - 2 * s.theta2)) || 1e-9;

        const a1Num =
            -gravity * (2 * s.m1 + s.m2) * Math.sin(s.theta1)
            - s.m2 * gravity * Math.sin(s.theta1 - 2 * s.theta2)
            - 2 * sin12 * s.m2 * (s.omega2 * s.omega2 * s.l2 + s.omega1 * s.omega1 * s.l1 * cos12);

        const a2Num =
            2 * sin12 * (
                s.omega1 * s.omega1 * s.l1 * (s.m1 + s.m2)
                + gravity * (s.m1 + s.m2) * Math.cos(s.theta1)
                + s.omega2 * s.omega2 * s.l2 * s.m2 * cos12
            );

        const alpha1 = a1Num / (s.l1 * den);
        const alpha2 = a2Num / (s.l2 * den);

        s.omega1 += alpha1 * stepDt;
        s.omega2 += alpha2 * stepDt;
        s.omega1 *= angularDamping;
        s.omega2 *= angularDamping;
        s.theta1 += s.omega1 * stepDt;
        s.theta2 += s.omega2 * stepDt;
    }

    pointList[0].x = leftOffset;
    pointList[0].y = anchorY;
    pointList[1].x = pointList[0].x + s.l1 * Math.sin(s.theta1);
    pointList[1].y = pointList[0].y + s.l1 * Math.cos(s.theta1);
    pointList[2].x = pointList[1].x + s.l2 * Math.sin(s.theta2);
    pointList[2].y = pointList[1].y + s.l2 * Math.cos(s.theta2);

    pointList[1].oldX = pointList[1].x;
    pointList[1].oldY = pointList[1].y;
    pointList[2].oldX = pointList[2].x;
    pointList[2].oldY = pointList[2].y;

    if(pointList.length <= 3) {
        return;
    }

    if(extensionMode === 'rigid') {
        solveTailRigid(pointList, dt, s);
        return;
    }

    for(let i = 3; i < pointList.length; i++) {
        const p = pointList[i];
        const vx = (p.x - p.oldX) * tailDamping;
        const vy = (p.y - p.oldY) * tailDamping;
        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx;
        p.y += vy + gravity * dt * dt;
    }

    for(let iter = 0; iter < tailSolverIters; iter++) {
        pointList[2].x = pointList[1].x + s.l2 * Math.sin(s.theta2);
        pointList[2].y = pointList[1].y + s.l2 * Math.cos(s.theta2);

        for(let i = 3; i < pointList.length; i++) {
            const a = pointList[i - 1];
            const b = pointList[i];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1e-9;
            const segLen = segmentLengthAt(i);
            const diff = (dist - segLen) / dist;

            if(i === 3) {
                b.x -= dx * diff;
                b.y -= dy * diff;
                continue;
            }

            const invA = a.invMass ?? 1;
            const invB = b.invMass ?? 1;
            const invSum = invA + invB || 1;
            const corrX = dx * diff;
            const corrY = dy * diff;
            a.x += corrX * (invA / invSum);
            a.y += corrY * (invA / invSum);
            b.x -= corrX * (invB / invSum);
            b.y -= corrY * (invB / invSum);
        }
    }
}

const solveTailRigid = function(pointList, dt, state){
    const stepDt = dt / INTERNAL_STEPS;

    for(let step = 0; step < INTERNAL_STEPS; step++) {
        let parentTheta = state.theta2;
        let parentOmega = state.omega2;

        for(let j = 0; j < state.tailThetas.length; j++) {
            const theta = state.tailThetas[j];
            const omega = state.tailOmegas[j];
            const tailLen = state.tailLengths[j] || coreLength2;
            const tailMass = state.tailMasses[j] || 1;

            const pendulumAlpha = -(gravity / tailLen) * Math.sin(theta);
            const angleError = shortestAngleDelta(parentTheta, theta);
            const omegaError = parentOmega - omega;
            const couplingAlpha = ((extensionCoupling * angleError) + (extensionRelativeDamping * omegaError)) / tailMass;
            const alpha = clamp(pendulumAlpha + couplingAlpha, -maxTailAngularAccel, maxTailAngularAccel);

            let nextOmega = omega + alpha * stepDt;
            nextOmega *= extensionAngularDamping;
            nextOmega = clamp(nextOmega, -maxTailAngularSpeed, maxTailAngularSpeed);
            const rawNextTheta = theta + nextOmega * stepDt;
            const nextTheta = Math.atan2(Math.sin(rawNextTheta), Math.cos(rawNextTheta));

            state.tailOmegas[j] = nextOmega;
            state.tailThetas[j] = nextTheta;
            parentTheta = nextTheta;
            parentOmega = nextOmega;
        }
    }

    let baseX = pointList[2].x;
    let baseY = pointList[2].y;
    for(let i = 3; i < pointList.length; i++) {
        const tailTheta = state.tailThetas[i - 3];
        const tailLen = state.tailLengths[i - 3] || coreLength2;
        const p = pointList[i];

        const nextX = baseX + tailLen * Math.sin(tailTheta);
        const nextY = baseY + tailLen * Math.cos(tailTheta);

        p.oldX = p.x;
        p.oldY = p.y;
        p.x = nextX;
        p.y = nextY;

        baseX = nextX;
        baseY = nextY;
    }
}

const drawMyLine = function(color='teal'){
    /* draw a randomly generated line path */

    /* Draw the horizon line - a straight project from A to B*/
    // randomLine.draw.horizonLine(ctx)
    // quickStroke('red')

    /* Draw each point as a line to its next sibling.*/
    randomLine.draw.pointLine(ctx)
    quickStroke(color, 5)


    /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
    randomLine.pen.points(ctx, (item,f)=>{
        ctx.beginPath();
        f(item)
        quickStroke('pink', 3)
    })

    // quickStroke('red')
    // May bleed if not applied.
    ctx.closePath();
}



;pendulum_main();