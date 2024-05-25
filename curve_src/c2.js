const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');

let A = { x: 100, y: 100 };
let B = { x: 700, y: 100 };
const nodes = [A, B];
let draggingNode = null;

let catenaryPoints = []; // Store points along the catenary curve
let time = 0;

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);

let rect = canvas.getBoundingClientRect()
ctx.canvas.width  = rect.width;
ctx.canvas.height = rect.height;

function onMouseDown(e) {
    const mousePos = getMousePos(canvas, e);
    draggingNode = nodes.find(node => distance(node, mousePos) < 10);
}

function onMouseMove(e) {
    if (draggingNode) {
        const mousePos = getMousePos(canvas, e);
        draggingNode.x = mousePos.x;
        draggingNode.y = mousePos.y;
    }
}

function onMouseUp() {
    draggingNode = null;
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function distance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}

// Function to calculate points along the catenary curve
function calculateCatenaryPoints(A, B) {
    const points = [];
    const numPoints = 100;
    const length = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
    const sag = 100; // Adjust sagging as needed

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = A.x + t * (B.x - A.x);
        const y = A.y + sag * Math.cosh((x - (A.x + B.x) / 2) / sag);
        points.push({ x, y });
    }

    return points;
}

// Function to draw the catenary curve
function drawCatenary(points) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw nodes A and B
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(A.x, A.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(B.x, B.y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

// Function to animate the swinging motion
function animate() {
    if (!draggingNode) {
        // Simple pendulum physics for swinging effect
        time += 0.05;
        A.y = 100 + 50 * Math.sin(time); // Example oscillation for A
        B.y = 100 + 50 * Math.cos(time); // Example oscillation for B
    }

    catenaryPoints = calculateCatenaryPoints(A, B);
    drawCatenary(catenaryPoints);

    requestAnimationFrame(animate);
}

// Start the animation
animate();
