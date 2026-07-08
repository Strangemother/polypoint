/*
title: Line Rider with Draggable Boundary
src_dir: ../point_src/
files:
    ../point_src/core/head.js
    ../point_src/stage.js
    ../point_src/point-content.js
    ../point_src/point.js
---

A simple example of gear-like rotations
*/

class Ball {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = 0; // Horizontal velocity
    this.vy = 0; // Vertical velocity
    this.gravity = 0.3; // Gravity strength
    this.friction = 0.995; // Friction to simulate rolling resistance
    this.bounceFactor = 0.7; // Coefficient of restitution (bounciness)
  }

  applyGravity() {
    this.vy += this.gravity;
  }

  update(centerX, centerY, boundaryRadius, boundaryVx, boundaryVy) {
    // Apply gravity
    this.applyGravity();

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Calculate distance from center
    const dx = this.x - centerX;
    const dy = this.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If the ball exceeds the boundary, constrain it
    const maxDistance = boundaryRadius - this.radius;
    if (distance > maxDistance) {
      // Project the ball back onto the circle's inner edge
      const angle = Math.atan2(dy, dx);
      this.x = centerX + Math.cos(angle) * maxDistance;
      this.y = centerY + Math.sin(angle) * maxDistance;

      // Decompose velocity into normal and tangent components
      const normalVelocity = (this.vx * Math.cos(angle)) + (this.vy * Math.sin(angle));
      const tangentVelocity = (-this.vx * Math.sin(angle)) + (this.vy * Math.cos(angle));

      // Apply bounce to the normal velocity and add boundary's velocity
      const bouncedNormalVelocity = -normalVelocity * this.bounceFactor;
      const combinedVx = boundaryVx * this.bounceFactor;
      const combinedVy = boundaryVy * this.bounceFactor;

      // Combine velocities
      this.vx = Math.cos(angle) * (bouncedNormalVelocity + combinedVx) - Math.sin(angle) * tangentVelocity * this.friction;
      this.vy = Math.sin(angle) * (bouncedNormalVelocity + combinedVy) + Math.cos(angle) * tangentVelocity * this.friction;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.stroke();
  }
}

class CircleBoundary {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.previousX = x;
    this.previousY = y;
    this.vx = 0; // Velocity in x direction
    this.vy = 0; // Velocity in y direction
    this.dragging = false;
  }

  startDrag(mouseX, mouseY) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= this.radius) {
      this.dragging = true;
    }
  }

  drag(mouseX, mouseY) {
    if (this.dragging) {
      this.previousX = this.x;
      this.previousY = this.y;
      this.x = mouseX;
      this.y = mouseY;
      this.vx = this.x - this.previousX;
      this.vy = this.y - this.previousY;
    }
  }

  stopDrag() {
    this.dragging = false;
    this.vx = 0;
    this.vy = 0;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Initialize ball and boundary
const boundary = new CircleBoundary(300, 300, 150);
const ball = new Ball(300, 180, 10);

// Canvas setup
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');

// Mouse event listeners for dragging
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  boundary.startDrag(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  boundary.drag(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mouseup', () => boundary.stopDrag());
canvas.addEventListener('mouseleave', () => boundary.stopDrag());

// Main draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update ball movement with boundary velocity
  ball.update(boundary.x, boundary.y, boundary.radius, boundary.vx, boundary.vy);

  // Draw boundary and ball
  boundary.draw(ctx);
  ball.draw(ctx);

  requestAnimationFrame(draw);
}

draw();

// Assuming StageRender is part of your environment
let sr = new StageRender();
sr.stickCanvasSize(canvas);
