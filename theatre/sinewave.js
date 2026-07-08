/*
title: Sine Wave Oscillation
categories: curve
files:
    head
    ../point_src/point-content.js
    pointlist
    point
    mouse
    stage
    dragging
    ../point_src/setunset.js
    ../point_src/stroke.js

 */

let time = 0
const frequency = 10; // Hz
const amplitude = 100;
const speed = 0 // time scaling
const offset = {x: 100, y:0}
const width = 600
const height = 500
// const points = [];

class MainStage extends Stage {
    canvas='playspace'

    // In your stage's draw method
    draw(ctx) {
        this.clear(ctx);

        drawSineWave(ctx, width, height);
        drawSineWaveLimited(ctx, 50, width, height);
        // drawSineWaveTips(ctx, width, height, time);
        let rps = drawSineWaveTips(ctx, width, height, time);

        let ps = PointList.from(rps).cast()
        this.ps = ps
        ps.offset(offset)
        ps.pen.line(ctx)

        // ps.pen.quadCurve(ctx)

        time += 1 / 600;
    }
}


function drawSineWave(ctx, width, height) {
    let points = plotSineWave(width, height)
    generalDrawPoints(ctx, points, offset)
}

function drawSineWaveLimited(ctx, numPoints, width, height) {
    let points = plotSineWaveLimited(numPoints, width, height)
    generalDrawPoints(ctx, points, offset, '#FF6699')
}


function drawSineWaveTips(ctx, width, height, time) {
    let points = plotSineWaveTips(width, height, time)
    // let points = plotSineWaveLimited(10, width, height)
    generalDrawPoints(ctx, points, offset, '#AA66DD', drawTips)
    return points
}

function generalDrawPoints(ctx, points, offset, color='#66AAFF', func=drawPoints){
    ctx.beginPath();
    func(ctx, points, offset)
    ctx.strokeStyle = color;
    ctx.stroke();
}


const drawPoints = function(ctx, points, o={x:0, y:0}) {
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (i === 0) ctx.moveTo(p.x + o.x, p.y + o.y);
        else ctx.lineTo(p.x + o.x, p.y + o.y);
    }
}

function drawTips(ctx, points, o={x:0, y:0}) {
    ctx.fillStyle = 'yellow';
    for (let p of points) {
        ctx.beginPath();
        ctx.arc(p.x + o.x, p.y + o.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}


// function plotSineWaveTips(width, height, time = 0) {
//     const centerY = height * 0.5;
//     const numTips = frequency * 2; // 2 tips (peak + trough) per full wave
//     let points = [];

//     for (let i = 0; i < numTips; i++) {
//         const t = time + i / (2 * frequency); // step by 1/(2f) to hit peaks/troughs
//         const x = (t - time) * width * frequency; // map time to width space
//         const y = centerY + Math.sin(2 * Math.PI * frequency * t) * amplitude;
//         points.push({ x, y });
//     }

//     return points;
// }



function plotSineWave(width, height) {
    const centerY = height * .5;
    let points = [];
    for (let x = 0; x < width; x++) {
        const t = time + x / width;
        const y = centerY + Math.sin(2 * Math.PI * frequency * t) * amplitude;
        points.push({ x, y });
    }
    return points
}


function plotSineWaveLimited(numPoints, width, height) {
    /* Given a number of points, plot along the spline.*/
    const centerY = height * .5;
    let points = [];
    for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - .1)) * width;
        const t = time + i / numPoints; // still time-based spacing
        const y = centerY + Math.sin(2 * Math.PI * frequency * t) * amplitude;
        points.push({ x, y });
    }
    return points
}


function plotSineWavePoints(width, height, time=0) {
    /* Plot static tips:

        drawSineWaveTips(ctx, 500, 400, Math.PI);
    */
    const centerY = height * 0.5;
    const numTips = frequency * 2; // 2 tips per full wave
    let points = [];

    for (let i = 0; i < numTips; i++) {
        const x = (i / (numTips - .01)) * width;
        const t = time + i / (2 * frequency); // still time-based for phase
        const y = centerY + Math.sin(2 * Math.PI * frequency * t) * amplitude;
        points.push({ x, y });
    }

    return points;
}

// function plotSineWaveTips(width, height, time = 0) {
//     const centerY = height * 0.5;
//     const numCycles = frequency;
//     const tips = [];

//     // Peaks/troughs occur every half cycle
//     for (let i = 0; i < numCycles * 2; i++) {
//         const tipTime = i / (2 * frequency); // actual time tip occurs
//         const phase = time - tipTime; // time difference between now and tip
//         const x = width - (phase * frequency * width); // shift right to left

//         if (x >= 0 && x <= width) {
//             const y = centerY + Math.sin(2 * Math.PI * frequency * (tipTime)) * amplitude;
//             tips.push({ x, y });
//         }
//     }

//     return tips;
// }


function plotSineWaveTipsSliding(width, height, time = 0) {
    const centerY = height * 0.5;
    const tips = [];
    const wavePeriod = 1 / frequency; // seconds per full wave
    const pixelsPerCycle = width / frequency;

    // Tips (peaks/troughs) occur every half cycle: every pixelsPerCycle / 2 pixels
    const spacing = pixelsPerCycle / 2;

    // Walk across the screen and check each expected tip location
    for (let x = 0; x <= width; x += spacing) {
        const t = time + x / width; // same logic as your wave formula
        const y = centerY + Math.sin(2 * Math.PI * frequency * t) * amplitude;
        tips.push({ x, y });
    }

    return tips;
}


function plotSineWaveTipsAtTime(width, height, time = 0) {
    const centerY = height * 0.5;
    const tips = [];

    // estimate how many tips to check
    const totalTips = Math.ceil(width / (width / frequency / 2)) + 2;

    for (let i = -totalTips; i < totalTips; i++) {
        const phaseOffset = (0.25 + i * 0.5) / frequency; // when tip occurs in time
        const x = width * (phaseOffset - time); // where it lands onscreen

        if (x >= 0 && x <= width) {
            const y = centerY + Math.sin(2 * Math.PI * frequency * (time + x / width)) * amplitude;
            tips.push({ x, y });
        }
    }

    return tips;
}


function x_plotSineWaveTips(width, height, time = 0) {
    const centerY = height * 0.5;
    const tips = [];

    // Tips happen at: x = width * ((0.25 + n*0.5)/frequency - time)
    // Solve for n range such that x in [0, width]
    const minN = Math.ceil((frequency * time - 1) / 0.5);
    const maxN = Math.floor((frequency * time + 1) / 0.5);

    for (let n = minN; n <= maxN; n++) {
        const phaseOffset = (0.25 + n * 0.5) / frequency;
        const x = width * (phaseOffset - time);

        if (x >= 0 && x <= width) {
            const y = centerY + Math.sin(2 * Math.PI * frequency * (time + x / width)) * amplitude;
            tips.push({ x, y });
        }
    }

    return tips;
}


function plotSineWaveTips(width, height, time = 0) {
    const centerY = height * 0.5;
    const tips = [];

    const pixelsPerCycle = width / frequency;
    const tipSpacing = pixelsPerCycle / 2;
    const maxVisibleTips = Math.ceil(width / tipSpacing) + 2;

    const currentPhase = frequency * time;
    const nCenter = Math.round(currentPhase / 0.5); // center tip index at current time

    const nStart = nCenter - maxVisibleTips;
    const nEnd = nCenter + maxVisibleTips;

    for (let n = nStart; n <= nEnd; n++) {
        const phaseOffset = (0.25 + n * 0.5) / frequency;
        const x = width * (phaseOffset - time);

        if (x >= 0 && x <= width) {
            const y = centerY + Math.sin(2 * Math.PI * frequency * (time + x / width)) * amplitude;
            tips.push({ x, y });
        }
    }

    return tips;
}


;stage = MainStage.go();