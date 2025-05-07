/*
---
title: 3D Sphere
categories: pseudo3D
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/rotate.js
    stroke
    ../point_src/distances.js
    ../point_src/dragging.js

---


*/
function generateSpherePoints(count = 100, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399...

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y from 1 to -1
    const r = Math.sqrt(1 - y * y);      // radius at y
    const theta = goldenAngle * i;      // angle around y-axis

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    points.push({ x: x * radius, y: y * radius, z: z * radius});
  }

  return points;
}

function generateSpherePoints1(count = 100, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399...

  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.9) / count) * 2;  // avoid exact poles
    const r = Math.sqrt(1 - y * y);        // radius at this y
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    points.push({ x: x * radius, y: y * radius, z: z * radius });
  }

  return points;
}


function generateSpherePoints2(count = 100, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399...

  for (let i = 0; i < count; i++) {
    const y = 1 - (i + 0.5) * (2 / count);  // y ∈ (1 - ε, -1 + ε)
    const r = Math.sqrt(1 - y * y);         // radial distance at that height
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    points.push({ x: x * radius, y: y * radius, z: z * radius });
  }

  return points;
}


function generateSpherePoints3(count = 100, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    let theta = goldenAngle * i;
    let y = 1 - (i + 0.5) * (2 / count);
    let r = Math.sqrt(1 - y * y);

    let x = Math.cos(theta) * r;
    let z = Math.sin(theta) * r;

    // Normalize to ensure perfect spherical radius
    const length = Math.sqrt(x * x + y * y + z * z);
    x = (x / length) * radius;
    y = (y / length) * radius;
    z = (z / length) * radius;

    points.push({ x, y, z });
  }

  return points;
}


function generateSpherePoints4(count = 100, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399...

  for (let i = 0; i < count; i++) {
    // Proper spacing to avoid poles
    const y = ((i + 0.5) / count) * 2 - 1;  // y in (-1, +1)
    const r = Math.sqrt(1 - y * y);        // radius at this height
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    points.push({ x: x * radius, y: y * radius, z: z * radius });
  }

  return points;
}


function generateSpherePointsFib(count = 100, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399

  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * 2;        // y in (-1, 1)
    const r = Math.sqrt(1 - y * y);               // radius at y
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    points.push({
      x: x * radius,
      y: y * radius,
      z: z * radius
    });
  }

  return points;
}


window.onmessage = function(e) {
    // console.log(e)
    stage.perspectiveCenter.set(e.data)
};


class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        let depth = this.depth = 400
        let count = 300
        let size = 200
        /* Generate 100 points, within a 500px box, at origin 0,0 */
        this.points = PointList.from(generateSpherePoints4(count, size)).cast()
        // this.points = PointList.from(generateSpherePointsFib(count, size)).cast()
        this.points.each.radius = 3
        // this.projectionPoint = this.points.center.copy()
        this.projectionLength = 500
        this.perspectiveCenter = this.center.copy()

        this.rotSize = 0
        this.performSpin = true
        this.zFix = true
        let stage = this;
    }

    step(){
        let spin = this.spin = {
                x: this.rotSize
                , y:  this.rotSize
                , z: -this.rotSize
            }

        this.spunPoints = this.points.pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
            )
        let maxDepth = this.depth
        let deepColor = 200
        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            let color = `hsl(${red} 66% 35%)`
            p.color = color
        })
        // this.zFix && this.spunPoints.sortByZ()
        // this.perspectiveCenter = this.spunPoints.copy().add(0, 0)


    }

    onMousedown(){
        this.performSpin = !this.performSpin
    }

    draw(ctx){
        this.clear(ctx)
        let sv = 0.02
        if(this.performSpin){
            sv = .2
        }
        this.rotSize += sv
        this.step()
        // let color = '#666'
        // this.points.pen.indicators(ctx, {color})
        // this.spunPoints.pen.indicators(ctx)
        let maxDepth = this.depth
        let deepColor = 200

        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            let color = p.color
            if(i == 0) { color = 'red'}
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            // let color = `hsl(${red} 66% 35%)`
            p.pen.fill(ctx, color)
        })
    }
}


;stage = MainStage.go();