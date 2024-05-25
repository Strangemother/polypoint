class Segment {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.content = []; // Could be entities, objects, etc.
  }

  // Render method for the segment
  render(ctx) {
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(this.x, this.y, this.size, this.size);
  }
}


class Grid {
  constructor(segmentSize) {
    this.segmentSize = segmentSize;
    this.segments = {};
  }

  getSegment(x, y) {
    const key = `${Math.floor(x / this.segmentSize)},${Math.floor(y / this.segmentSize)}`;
    if (!this.segments[key]) {
      this.segments[key] = new Segment(Math.floor(x / this.segmentSize) * this.segmentSize, Math.floor(y / this.segmentSize) * this.segmentSize, this.segmentSize);
    }
    return this.segments[key];
  }

  render(ctx, viewportX, viewportY, viewportWidth, viewportHeight) {
    const startX = Math.floor(viewportX / this.segmentSize) * this.segmentSize;
    const startY = Math.floor(viewportY / this.segmentSize) * this.segmentSize;
    const endX = Math.ceil((viewportX + viewportWidth) / this.segmentSize) * this.segmentSize;
    const endY = Math.ceil((viewportY + viewportHeight) / this.segmentSize) * this.segmentSize;

    for (let x = startX; x < endX; x += this.segmentSize) {
      for (let y = startY; y < endY; y += this.segmentSize) {
        this.getSegment(x, y).render(ctx);
      }
    }
  }
}

// Example usage
const grid = new Grid(200);

// Inside your draw function
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);
  grid.render(ctx, -offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);
}
