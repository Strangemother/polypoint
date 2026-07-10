const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const points = generateRandomPoints(20, canvas.width, canvas.height);
const minDistance = 30;
const attractionStrength = 0.001;
const repulsionStrength = 200; // Increased strength for effective repulsion
const damping = 0.9; // Damping factor to reduce velocity over time

function generateRandomPoints(numPoints, width, height) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0
        });
    }
    return points;
}

function updatePoints() {
    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                const dx = points[j].x - points[i].x;
                const dy = points[j].y - points[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    const repulsionForce = repulsionStrength / (distance * distance);
                    points[i].vx -= repulsionForce * dx / distance;
                    points[i].vy -= repulsionForce * dy / distance;
                }
            }
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = centerX - points[i].x;
        const dy = centerY - points[i].y;
        points[i].vx += attractionStrength * dx;
        points[i].vy += attractionStrength * dy;

        // Apply damping to reduce velocity over time
        points[i].vx *= damping;
        points[i].vy *= damping;

        points[i].x += points[i].vx;
        points[i].y += points[i].vy;
    }
}

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    updatePoints();
    drawPoints();
    requestAnimationFrame(animate);
}

animate();
