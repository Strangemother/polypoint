/*
title: 3D Sphere
categories: pseudo3D
files:
    head
    point
    pointlist
    mouse
    stage
    ../point_src/rotate.js
    stroke
    ../point_src/distances.js
    ../point_src/dragging.js
    ../theatre/multisheet-component.js
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



function generateSpherePointsFib(count = 100, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399

  for (let i = 0; i < count; i++) {
    // let y = 1 - (i + 0.5) * (2 / count);
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
        let depth = this.depth = 500
        let count = 500
        let size = 290
        /* Generate 100 points, within a 500px box, at origin 0,0 */
        this.points = PointList.from(generateSpherePointsFib(count, size)).cast()
        // this.points = PointList.from(generateSpherePointsFib(count, size)).cast()
        this.points.each.radius = 2
        // this.projectionPoint = this.points.center.copy()
        this.projectionLength = 400
        this.perspectiveCenter = this.center.copy()

        this.rotSize = 0
        this.performSpin = false
        this.zFix = true
        let stage = this;
    }


    step(){
        let spin = this.spin = {
                x: this.rotSize - 100
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
        let deepColor = 600
        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            let color = `hsl(${red} 66% 35%)`
            p.color = color
        })
        this.zFix && this.spunPoints.sortByZ()
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