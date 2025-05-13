/*
---
title: 3D Tetrahedron
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

---


*/


window.onmessage = function(e) {
    // console.log(e)
    stage.perspectiveCenter.set(e.data)
};




function generateRadialTetrahedronMesh(targetCount = 500, radius = 1) {
  const sqrt3 = Math.sqrt(3);

  const vertices = [
    [1, 1, 1],
    [-1, -1, 1],
    [-1, 1, -1],
    [1, -1, -1],
  ];

  const faces = [
    [0, 1, 2],
    [0, 3, 1],
    [0, 2, 3],
    [1, 3, 2],
  ];

  const normalize = ([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [x / len * radius, y / len * radius, z / len * radius];
  };

  const allPoints = [];
  const allTriangles = [];
  let indexOffset = 0;

  const pointsPerFace = Math.floor(targetCount / 4);

  function sampleFace(v0, v1, v2, count, indexOffset) {
    const pts = [];
    const tris = [];

    const n = Math.ceil(Math.sqrt(count));
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n - i; j++) {
        const a = i / n;
        const b = j / n;
        const c = 1 - a - b;
        const x = a * v0[0] + b * v1[0] + c * v2[0];
        const y = a * v0[1] + b * v1[1] + c * v2[1];
        const z = a * v0[2] + b * v1[2] + c * v2[2];
        pts.push(normalize([x, y, z]));
      }
    }

    // approximate triangle connection for now — could be refined
    let pointIndex = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i; j++) {
        const a = pointIndex;
        const b = pointIndex + 1;
        const c = pointIndex + (n - i + 1);
        const d = c + 1;

        if (j < n - i - 1) {
          tris.push([indexOffset + a, indexOffset + b, indexOffset + c]);
          tris.push([indexOffset + b, indexOffset + d, indexOffset + c]);
        } else {
          tris.push([indexOffset + a, indexOffset + b, indexOffset + c]);
        }

        pointIndex++;
      }
      pointIndex++;
    }

    return { pts, tris };
  }

  for (const face of faces) {
    const [v0, v1, v2] = face.map(i => vertices[i]);
    const { pts, tris } = sampleFace(v0, v1, v2, pointsPerFace, indexOffset);
    allPoints.push(...pts);
    allTriangles.push(...tris);
    indexOffset += pts.length;
  }

  const pointList = allPoints.map(([x, y, z]) => ({ x, y, z }));

  return {
    points: pointList,
    triangles: allTriangles,
  };
}



function generateFlatTetrahedronMesh(targetCount = 500, size = 1) {
  // Regular tetrahedron, centered at origin
  const sqrt3 = Math.sqrt(3);
  const sqrt6 = Math.sqrt(6);
  const vertices = [
    [0, 0, size * Math.sqrt(6) / 4],  // Top vertex
    [0, size / Math.sqrt(3), -size / 4], // Base vertex 1
    [-size / 2, -size / (2 * Math.sqrt(3)), -size / 4], // Base vertex 2
    [size / 2, -size / (2 * Math.sqrt(3)), -size / 4]   // Base vertex 3
  ];

  const faces = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 1],
    [1, 3, 2]
  ];

  const allPoints = [];
  const allTriangles = [];
  let indexOffset = 0;

  const pointsPerFace = Math.floor(targetCount / 4);

  function sampleFace(v0, v1, v2, count, offset) {
    const pts = [];
    const tris = [];

    const n = Math.ceil(Math.sqrt(count));
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n - i; j++) {
        const a = i / n;
        const b = j / n;
        const c = 1 - a - b;

        const x = a * v0[0] + b * v1[0] + c * v2[0];
        const y = a * v0[1] + b * v1[1] + c * v2[1];
        const z = a * v0[2] + b * v1[2] + c * v2[2];

        pts.push({ x, y, z });
      }
    }

    // Connect triangles across this barycentric grid
    let pointIndex = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i; j++) {
        const a = pointIndex;
        const b = pointIndex + 1;
        const c = pointIndex + (n - i + 1);
        const d = c + 1;

        tris.push([offset + a, offset + b, offset + c]);
        if (j < n - i - 1) {
          tris.push([offset + b, offset + d, offset + c]);
        }

        pointIndex++;
      }
      pointIndex++;
    }

    return { pts, tris };
  }

  for (const face of faces) {
    const [v0, v1, v2] = face.map(i => vertices[i]);
    const { pts, tris } = sampleFace(v0, v1, v2, pointsPerFace, indexOffset);
    allPoints.push(...pts);
    allTriangles.push(...tris);
    indexOffset += pts.length;
  }

  return {
    points: allPoints,
    triangles: allTriangles
  };
}





function generateSquarePyramidMesh(targetCount = 500, size = 1) {
  const half = size / 2;

  // Vertices of square-based pyramid (apex at +Y)
  const apex = [0, half, 0];
  const base = [
    [-half, -half, -half],
    [half, -half, -half],
    [half, -half, half],
    [-half, -half, half]
  ];

  const vertices = [apex, ...base];
  const faces = [
    [0, 1, 2], // side 1
    [0, 2, 3], // side 2
    [0, 3, 4], // side 3
    [0, 4, 1], // side 4
    [1, 2, 3], // base part 1
    [1, 3, 4], // base part 2
  ];

  const allPoints = [];
  const allTriangles = [];
  let indexOffset = 0;

  const pointsPerFace = Math.floor(targetCount / faces.length);

  function sampleTriangle(v0, v1, v2, count, offset) {
    const pts = [];
    const tris = [];

    const n = Math.ceil(Math.sqrt(count));
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n - i; j++) {
        const a = i / n;
        const b = j / n;
        const c = 1 - a - b;

        const x = a * v0[0] + b * v1[0] + c * v2[0];
        const y = a * v0[1] + b * v1[1] + c * v2[1];
        const z = a * v0[2] + b * v1[2] + c * v2[2];
        pts.push({ x, y, z });
      }
    }

    let pointIndex = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i; j++) {
        const a = pointIndex;
        const b = pointIndex + 1;
        const c = pointIndex + (n - i + 1);
        const d = c + 1;

        tris.push([offset + a, offset + b, offset + c]);
        if (j < n - i - 1) {
          tris.push([offset + b, offset + d, offset + c]);
        }

        pointIndex++;
      }
      pointIndex++;
    }

    return { pts, tris };
  }

  for (const face of faces) {
    const [v0, v1, v2] = face.map(i => vertices[i]);
    const { pts, tris } = sampleTriangle(v0, v1, v2, pointsPerFace, indexOffset);
    allPoints.push(...pts);
    allTriangles.push(...tris);
    indexOffset += pts.length;
  }

  return {
    points: allPoints,
    triangles: allTriangles
  };
}









class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        let depth = this.depth = 900
        let count = 500
        let size = 290
        // this.points = PointList.from(generateRadialTetrahedronMesh(500, 200).points).cast()
        this.points = PointList.from(generateFlatTetrahedronMesh(500, 400).points).cast()
        // this.points = PointList.from(generateSquarePyramidMesh(300, 500).points).cast()

        this.points.each.radius = 2
        // this.projectionPoint = this.points.center.copy()
        this.projectionLength = 800
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
        let deepColor = 900

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