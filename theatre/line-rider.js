/*
title: Line Rider
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

  update(centerX, centerY, boundaryRadius) {
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

      // Apply bounce to the normal velocity
      const bouncedNormalVelocity = -normalVelocity * this.bounceFactor;

      // Combine the bounced normal velocity with the tangent velocity
      this.vx = Math.cos(angle) * bouncedNormalVelocity - Math.sin(angle) * tangentVelocity * this.friction;
      this.vy = Math.sin(angle) * bouncedNormalVelocity + Math.cos(angle) * tangentVelocity * this.friction;
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
const ball = new Ball(240, 180, 10);

function draw(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Update ball movement
  ball.update(boundary.x, boundary.y, boundary.radius);

  // Draw boundary and ball
  boundary.draw(ctx);
  ball.draw(ctx);

  requestAnimationFrame(() => draw(ctx));
}

// Initialize canvas
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
draw(ctx);


let sr = new StageRender();
sr.stickCanvasSize(canvas)
