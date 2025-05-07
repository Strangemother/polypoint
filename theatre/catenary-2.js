/*
title: Catenary Example By GPT
categories: raw
  broken
  gpt
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    mouse
    dragging
    stroke
    ../theatre/a.js
---

Spoiler. It's broke.
*/

/**
 * Simple Node/Weight definition
 */
class Node {
  constructor({ x, y, mass = 1, isWeight = false }) {
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.isWeight = isWeight;
  }
}

/**
 * Solve for c so that the catenary y(x) = y0 + c cosh((x - x0)/c)
 * passes exactly through (xA,yA) and (xB,yB), assuming x0 = (xA + xB)/2.
 */
function solveCatenaryParams(xA, yA, xB, yB) {
  // 1) define midpoint x0
  const x0 = (xA + xB) / 2;

  // 2) define F(c) = 0
  function F(c) {
    // The cosh terms
    const coshA = Math.cosh((xA - x0) / c);
    const coshB = Math.cosh((xB - x0) / c);

    // We define y0 from the A condition:
    //    y0 = yA - c coshA
    // Then plug into the B condition => F(c) = [that expression] + c coshB - yB
    return (yA - c * coshA) + c * coshB - yB;
  }

  // 3) We need a numeric approach to solve F(c) = 0 for c.
  //    We'll do a simple bisection between cMin and cMax.
  //    We assume c > 0 always. Let's pick some range for c.
  //    We'll pick cMin = 1e-3, cMax = big. We'll refine until we find a sign change.

  let cMin = 1e-3;
  let cMax = 10000; // large upper guess
  // Check sign of F at min
  let fMin = F(cMin);
  let fMax = F(cMax);

  // If fMin and fMax have the same sign, we may widen cMax more or do other logic.
  // For simplicity, let's do a loop that expands cMax until sign changes or hits a limit:
  let attempts = 0;
  while (fMin * fMax > 0 && attempts < 50) {
    cMax *= 2;
    fMax = F(cMax);
    attempts++;
  }
  // Now do bisection
  for (let i = 0; i < 60; i++) {
    const cMid = (cMin + cMax) / 2;
    const fMid = F(cMid);
    if (Math.abs(fMid) < 1e-7) {
      // close enough
      cMin = cMid;
      cMax = cMid;
      break;
    }
    if (fMid * fMin > 0) {
      // same sign as fMin => move cMin to cMid
      cMin = cMid;
      fMin = fMid;
    } else {
      // move cMax to cMid
      cMax = cMid;
      fMax = fMid;
    }
  }
  const c = (cMin + cMax) / 2;

  // 4) Now compute y0 from the A condition
  const coshA = Math.cosh((xA - x0) / c);
  const y0 = yA - c * coshA;

  return { c, x0, y0 };
}

/**
 * Compute an array of (x,y) points along the catenary
 * that exactly passes (xA,yA) and (xB,yB).
 *
 * We'll sample from xA..xB in numPoints steps.
 */
function getExactCatenaryPoints(nodeA, nodeB, numPoints = 50) {
  const { x: xA, y: yA } = nodeA;
  const { x: xB, y: yB } = nodeB;

  // If xA == xB, we can just draw a vertical line (special case).
  if (Math.abs(xB - xA) < 1e-9) {
    // Return a vertical line set of points
    const points = [];
    const minY = Math.min(yA, yB);
    const maxY = Math.max(yA, yB);
    for (let i = 0; i <= numPoints; i++) {
      const ty = minY + i * (maxY - minY) / numPoints;
      points.push({ x: xA, y: ty });
    }
    return points;
  }

  // Solve for c and y0
  const { c, x0, y0 } = solveCatenaryParams(xA, yA, xB, yB);

  // Sample x from xA..xB
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = xA + t * (xB - xA);
    const y = y0 + c * Math.cosh((x - x0) / c);
    points.push({ x, y });
  }
  return points;
}

/**
 * Draw a path through the given points on canvas
 */
function drawCurve(ctx, points, strokeStyle = 'black', lineWidth = 2) {
  if (!points || points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/**
 * Draw a circular weight on canvas
 */
function drawWeight(ctx, node, radius = 6, color = 'red') {
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function main() {
  const canvas = document.getElementById('playspace');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1) Define anchor and weights
  //    (In a real physical solution, the node positions
  //     would come from an equilibrium solver. Here we
  //     just pick arbitrary coords to demonstrate.)
  const A  = new Node({ x:  80, y: 120, mass: 0, isWeight: false });
  const W1 = new Node({ x: 220, y: 220, mass: 2, isWeight: true  });
  const W2 = new Node({ x: 380, y: 320, mass: 3, isWeight: true  });
  const W3 = new Node({ x: 550, y: 180, mass: 4, isWeight: true  });
  const B  = new Node({ x: 700, y: 140, mass: 0, isWeight: false });

  // 2) Build segments
  const segments = [
    { start: A,  end: W1 },
    { start: W1, end: W2 },
    { start: W2, end: W3 },
    { start: W3, end: B  },
  ];

  // 3) For each segment, get points for the EXACT catenary
  //    that pins at the start & end nodes, then draw it
  segments.forEach(seg => {
    const catPoints = getExactCatenaryPoints(seg.start, seg.end, 60);
    drawCurve(ctx, catPoints, 'green', 2);
  });

  // 4) Draw the lumps (weights) in red
  const allNodes = [A, W1, W2, W3, B];
  allNodes.forEach(node => {
    if (node.isWeight) {
      const radius = 4 + node.mass;
      drawWeight(ctx, node, radius, 'red');
    }
  });

  // 5) Optionally draw anchors (A,B) in blue
  [A, B].forEach(anchor => {
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'blue';
    ctx.fill();
  });
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        main()
    }

    onMousedown(ev) {
        // this.iPoint.rotation = random.int(180)
        // commands.move(...this.point.xy)
    }

    draw(ctx){
        // this.clear(ctx)
        // this.point.pen.indicator(ctx)
    }
}


console.log('chord');


stage = MainStage.go(/*{ loop: true }*/)
