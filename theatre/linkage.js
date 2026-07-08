/*
---
title: Semi Circle.
categories:
    arc
    angles
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/protractor.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
    ../point_src/angle.js
    ../point_src/text/label.js
    ../point_src/arc.js
    ../point_src/tethers-vec.js
    ../point_src/protractor.js
---

Draw a semi-circle to another point _through_ a third point.

*/



  // const canvas = document.getElementById('myCanvas');
  // const ctx    = canvas.getContext('2d');

  // ---------------------------------------------------------------------------
  // 1) Initial positions
  //    M is fixed in place. A and B define a bar that passes through M.
  // ---------------------------------------------------------------------------
  let M = new Point({ x: 300, y: 200 });  // The pinned point, DOES NOT MOVE
  let A = new Point({ x: 200, y: 200 });  // Red endpoint
  let B = new Point({ x: 400, y: 200 });  // Blue endpoint

  // The bar length L
  const L = 500// distance(A, B);

  // We'll store direction factors for each end. They determine on which
  // "side" of M the bar extends. We get them from the initial configuration.
  const dirA = getDirectionFactor(A, B, M);  // if we drag A, how do we find B?
  const dirB = getDirectionFactor(B, A, M);  // if we drag B, how do we find A?

  // Currently dragging? "A" | "B" | null
  let dragging = null;
  // stop dragging if mouse leaves

  // Draw initially
  // draw();

  // ---------------------------------------------------------------------------
  // MOUSE HANDLERS
  // ---------------------------------------------------------------------------
  function onMouseDown(e) {
    const { x, y } = getMousePos(e);
    if (distance({x, y}, A) < 10) {
      dragging = "A";
    } else if (distance({x, y}, B) < 10) {
      dragging = "B";
    } else {
      dragging = null;
    }
  }


  function onMouseMove(e) {
    if (!dragging) return;
    const { x, y } = getMousePos(e);

    let pair = { A: B, B: A }
    let nodes = { A, B }

    let n = nodes[dragging]
    n.x = x
    n.y = y

    repositionXfromX(n, pair[dragging], M, dirA);
  }

  function onMouseUp(e) {
    dragging = null;
  }


 function repositionXfromX(a, b, m, directionFactor) {
    const Mx = m.x - a.x;
    const My = m.y - a.y;
    const distM = Math.hypot(Mx, My);

    if (distM < 1e-9) {
      b.x = a.x;
      b.y = a.y;
      return;
    }

    const s = directionFactor * (L / distM);
    b.x = a.x + s * Mx;
    b.y = a.y + s * My;
 }


  /**
   * Figure out whether s = +L/|AM| or -L/|AM| for the initial configuration.
   *
   * We'll solve B - A = s*(M - A), and check sign of 's' from the current positions.
   * s = ((B - A) dot (M - A)) / |M - A|^2
   */
  function getDirectionFactor(A, B, M) {
    const AM = { x: M.x - A.x, y: M.y - A.y };
    const AB = { x: B.x - A.x, y: B.y - A.y };

    const dot = AM.x*AB.x + AM.y*AB.y;
    const magAM2 = AM.x*AM.x + AM.y*AM.y;
    if (magAM2 < 1e-9) return +1; // degenerate
    const s = dot / magAM2; // could be pos or neg
    return (s >= 0) ? +1 : -1;
  }


  function distance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }


class TrackPoint extends Point {
    xSet(value) {
        if(this._prevX == value) {
            return
        }

        // console.log('x', value)
        this.dirty = true;
        this._prevX = value;

    }

    ySet(value) {
        if(this._prevY == value) {
            return
        }

        // console.log('y', value)
        this.dirty = true;
        this._prevY = value;

    }

    step() {
        if(this.dirty) {
            // console.log('step')
            this.dirty = false
            this.lookAt(this.pin)
            if(this.other.dirty == false) {
              this.other.update(projectFrom(this, 300))
            }
        }
    }
}


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.spinner = new Point({x:200, y:150, radius: 100, color: '#880000'})
        this.pinPoint = new Point({x:420, y:150, radius: 100, color: '#880000'})
        this.aPoint = new TrackPoint({
                x:200, y:300,
                pin: this.pinPoint,
                color: 'cyan'
            })
        this.bPoint = new TrackPoint({
                x:230, y:190,
                pin: this.pinPoint,
                color: 'purple',
            })

        this.aPoint.other = this.bPoint
        this.bPoint.other = this.aPoint

        let cp = this.spinner.tethers.add(this.bPoint)
        this.dragging.addPoints(
            this.spinner,
            this.pinPoint,
            this.aPoint, this.bPoint
            )

        // ---------------------------------------------------------------------------
        // 2) Event listeners
        const canvas = this.canvas
        window.canvas = canvas

        // ---------------------------------------------------------------------------
        canvas.addEventListener('mousedown',  onMouseDown);
        canvas.addEventListener('mousemove',  onMouseMove);
        canvas.addEventListener('mouseup',    onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);
    }

    draw(ctx){
        this.clear(ctx)

        ctx.fillStyle = '#555'
        ctx.strokeStyle = 'orange'

        // this.pinPoint.step()
        this.spinner.tethers.step()
        this.bPoint.dirty = true
        this.aPoint.step()
        this.bPoint.step()

        // Draw the bar (line from A to B)
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#333";
        ctx.stroke();

        // Draw A (red)
        this.drawPoint(ctx, A.x, A.y, "red");
        // Draw B (blue)
        this.drawPoint(ctx, B.x, B.y, "blue");
        // Draw M (green) - pinned/fixed
        this.drawPoint(ctx, M.x, M.y, "green");

        this.pinPoint.pen.circle(ctx, {color: 'purple'})
        this.pinPoint.pen.fill(ctx, '#990290', 3)

        this.aPoint.pen.indicator(ctx)
        this.bPoint.pen.indicator(ctx)
        this.aPoint.pen.line(ctx, this.bPoint, 'pink')

        this.spinner.pen.indicator(ctx)
        this.spinner.rotation += 1
    }

    drawPoint(ctx, x, y, color) {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2*Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();
    }

}


;stage = MainStage.go();

