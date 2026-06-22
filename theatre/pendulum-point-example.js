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
const SOLVER_ITERS = 12;
const ADAPTIVE_SUBSTEPS = false;
const MAX_SUBSTEPS = 5;
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
        const substeps = getSubstepCount(randomLine);
        solveLine(randomLine, FIXED_DT, substeps);
        accumulator -= FIXED_DT;
    }
}

const getSubstepCount = function(pointList) {
    if(!ADAPTIVE_SUBSTEPS || !pointList || pointList.length < 2) {
        return 1;
    }

    let maxStretch = 0;
    for(let i = 1; i < pointList.length; i++) {
        const a = pointList[i - 1];
        const p = pointList[i];
        const dx = p.x - a.x;
        const dy = p.y - a.y;
        const dist = Math.hypot(dx, dy);
        const stretch = Math.abs(dist - length) / length;
        if(stretch > maxStretch) {
            maxStretch = stretch;
        }
    }

    if(maxStretch > 0.25) return Math.min(MAX_SUBSTEPS, 5);
    if(maxStretch > 0.12) return Math.min(MAX_SUBSTEPS, 4);
    if(maxStretch > 0.06) return Math.min(MAX_SUBSTEPS, 3);
    if(maxStretch > 0.03) return Math.min(MAX_SUBSTEPS, 2);
    return 1;
}

var leftOffset;

var randomLine;
var length = 220;           // longer arms — key for chaotic coupling
var gravity = 2200;
var damping = 0.9998;       // near-lossless — preserves energy for chaotic motion
var members = 3;            // few arms: 2–4 is the chaos sweet spot
var anchorY = 180;
var randomStartMinDeg = -160;
var randomStartMaxDeg = 160;
var randomStartImpulse = 1.8;

const setupPendulum = function (){
    leftOffset = canvas.width * .5;

    randomLine = PointList.generate.list(members, length)
    const minRad = randomStartMinDeg * Math.PI / 180;
    const maxRad = randomStartMaxDeg * Math.PI / 180;
    const initialThetaFromDown = minRad + (.8 * (maxRad - minRad));

    randomLine[0].x = leftOffset;
    randomLine[0].y = anchorY;

    for(let i = 1; i < randomLine.length; i++) {
        const prev = randomLine[i - 1];
        const p = randomLine[i];
        p.x = prev.x + length * Math.sin(initialThetaFromDown);
        p.y = prev.y + length * Math.cos(initialThetaFromDown);
    }

    randomLine.forEach((p)=>{
        p.oldX = p.x;
        p.oldY = p.y;
        p.isDrag = false;
        p.mass = 1;
        p.invMass = 1;
    })

    randomLine[0].mass = Infinity;
    randomLine[0].invMass = 0;

    // Equal masses at each joint — concentrated point masses drive chaotic coupling.
    // Avoid a mass gradient here; distributed mass makes it rope-like instead.
    for(let i = 1; i < randomLine.length; i++) {
        randomLine[i].mass = 1;
        randomLine[i].invMass = 1;
    }

    // Seed each free joint with an independent random impulse so each run
    // starts from a different point in phase space — this is what triggers
    // diverging chaotic trajectories rather than periodic oscillation.
    for(let i = 1; i < randomLine.length; i++) {
        const p = randomLine[i];
        p.oldX = p.x + (Math.random() * 2 - 1) * randomStartImpulse;
        p.oldY = p.y + (Math.random() * 2 - 1) * randomStartImpulse * 0.4;
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


const solveLine = function(pointList, dt, substeps=1){
    if(!pointList || pointList.length < 2) {
        return;
    }

    const anchor = pointList[0];

    for(let i = 1; i < pointList.length; i++) {
        const p = pointList[i];
        if(p.isDrag) {
            continue;
        }

        const vx = (p.x - p.oldX) * damping;
        const vy = (p.y - p.oldY) * damping;
        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx;
        p.y += vy + gravity * dt * dt;
    }

    const totalIters = SOLVER_ITERS * Math.max(1, substeps);
    for(let iter = 0; iter < totalIters; iter++) {
        anchor.x = leftOffset;
        anchor.y = anchorY;

        for(let i = 1; i < pointList.length; i++) {
            const a = pointList[i - 1];
            const b = pointList[i];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1e-9;
            const diff = (dist - length) / dist;

            const wA = a.isDrag ? 0 : (a.invMass ?? 1);
            const wB = b.isDrag ? 0 : (b.invMass ?? 1);
            const wSum = wA + wB;
            if(wSum === 0) {
                continue;
            }

            const corrX = dx * diff;
            const corrY = dy * diff;
            a.x += corrX * (wA / wSum);
            a.y += corrY * (wA / wSum);
            b.x -= corrX * (wB / wSum);
            b.y -= corrY * (wB / wSum);
        }
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