
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


function generateSpherePointsLatLong(latCount = 10, lonCount = 20, radius = 1) {
  const points = [];

  // Latitude from 0 (north pole) to PI (south pole)
  for (let lat = 0; lat <= latCount; lat++) {
    const theta = (lat * Math.PI) / latCount; // polar angle
    const y = Math.cos(theta);                // y = cos(theta)
    const r = Math.sin(theta);                // horizontal radius at this latitude

    // Longitude from 0 to 2*PI
    for (let lon = 0; lon < lonCount; lon++) {
      const phi = (lon * 2 * Math.PI) / lonCount; // azimuthal angle

      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;

      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius
      });
    }
  }

  return points;
}


function generateSphereTriangles(latCount = 10, lonCount = 20) {
  const indices = [];

  for (let lat = 0; lat < latCount; lat++) {
    for (let lon = 0; lon < lonCount; lon++) {
      const current = lat * lonCount + lon;
      const next = current + lonCount;

      const nextLon = (lon + 1) % lonCount;

      // Triangle 1
      indices.push([
        current,
        lat * lonCount + nextLon,
        next
      ]);

      // Triangle 2
      indices.push([
        next,
        lat * lonCount + nextLon,
        next + nextLon - lon
      ]);
    }
  }

  return indices;
}

function generateSphereTrianglesAsPoints(latCount = 10, lonCount = 20, radius = 1) {
  const basePoints = generateSpherePointsLatLong(latCount, lonCount, radius);
  const triangles = generateSphereTriangles(latCount, lonCount);

  const trianglePoints = [];

  for (const tri of triangles) {
    trianglePoints.push(
      basePoints[tri[0]],
      basePoints[tri[1]],
      basePoints[tri[2]]
    );
  }

  return trianglePoints;
}


function normalize(v, radius = 1) {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return {
    x: (v.x / length) * radius,
    y: (v.y / length) * radius,
    z: (v.z / length) * radius
  };
}

// returns mid-point of two vectors on the sphere
function midpoint(a, b, radius) {
  return normalize({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2
  }, radius);
}

function generateLesserGeodesicSphere(radius = 1) {
  const t = (1 + Math.sqrt(5)) / 2;

  // Base icosahedron vertices
  let raw = [
    [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
    [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
    [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1]
  ];

  const verts = raw.map(([x, y, z]) => normalize({ x, y, z }, radius));

  // Icosahedron faces (20)
  const faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
  ];

  // Optional: one level of subdivision
  const finalPoints = [];
  for (const [a, b, c] of faces) {
    const v1 = verts[a];
    const v2 = verts[b];
    const v3 = verts[c];

    // midpoints
    const ab = midpoint(v1, v2, radius);
    const bc = midpoint(v2, v3, radius);
    const ca = midpoint(v3, v1, radius);

    // create 4 smaller triangles per face
    finalPoints.push(v1, ab, ca);
    finalPoints.push(ab, v2, bc);
    finalPoints.push(ca, bc, v3);
    finalPoints.push(ab, bc, ca);
  }

  return finalPoints;
}



function generateGeodesicSpherePoints(subdivisions = 2, radius = 1) {
  const t = (1 + Math.sqrt(5)) / 2;

  const rawVerts = [
    [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
    [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
    [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1],
  ];

  const normalize = ([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [x / len * radius, y / len * radius, z / len * radius];
  };

  let vertices = rawVerts.map(normalize);

  let faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ];

  const midpointCache = {};

  const getMidpoint = (i1, i2) => {
    const key = [i1, i2].sort().join(',');
    if (midpointCache[key] !== undefined) return midpointCache[key];

    const [v1, v2] = [vertices[i1], vertices[i2]];
    const mid = normalize([
      (v1[0] + v2[0]) / 2,
      (v1[1] + v2[1]) / 2,
      (v1[2] + v2[2]) / 2,
    ]);
    const index = vertices.length;
    vertices.push(mid);
    midpointCache[key] = index;
    return index;
  };

  for (let s = 0; s < subdivisions; s++) {
    const newFaces = [];
    for (const [a, b, c] of faces) {
      const ab = getMidpoint(a, b);
      const bc = getMidpoint(b, c);
      const ca = getMidpoint(c, a);

      newFaces.push([a, ab, ca]);
      newFaces.push([b, bc, ab]);
      newFaces.push([c, ca, bc]);
      newFaces.push([ab, bc, ca]);
    }
    faces = newFaces;
  }

  // convert vertices into {x,y,z} objects
  const pointList = vertices.map(([x, y, z]) => ({ x, y, z }));

  return {
    points: pointList,
    triangles: faces,
  };
}



function generateGeodesicSphereByPointCount(targetCount = 100, radius = 1) {
  const t = (1 + Math.sqrt(5)) / 2;

  const rawVerts = [
    [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
    [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
    [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1],
  ];

  const normalize = ([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [x / len * radius, y / len * radius, z / len * radius];
  };

  let vertices = rawVerts.map(normalize);

  let faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ];

  const midpointCache = {};
  const getMidpoint = (i1, i2) => {
    const key = [i1, i2].sort().join(',');
    if (midpointCache[key] !== undefined) return midpointCache[key];
    const [v1, v2] = [vertices[i1], vertices[i2]];
    const mid = normalize([
      (v1[0] + v2[0]) / 2,
      (v1[1] + v2[1]) / 2,
      (v1[2] + v2[2]) / 2,
    ]);
    const index = vertices.length;
    vertices.push(mid);
    midpointCache[key] = index;
    return index;
  };

  // Estimate required subdivisions
  let subdivisions = 0;
  while ((10 * 4 ** subdivisions + 2) < targetCount) {
    subdivisions++;
  }

  for (let s = 0; s < subdivisions; s++) {
    const newFaces = [];
    for (const [a, b, c] of faces) {
      const ab = getMidpoint(a, b);
      const bc = getMidpoint(b, c);
      const ca = getMidpoint(c, a);
      newFaces.push([a, ab, ca]);
      newFaces.push([b, bc, ab]);
      newFaces.push([c, ca, bc]);
      newFaces.push([ab, bc, ca]);
    }
    faces = newFaces;
  }

  const pointList = vertices.map(([x, y, z]) => ({ x, y, z }));
  return pointList;
}


function generateGeodesicSphereMesh(targetCount = 100, radius = 1) {
  const t = (1 + Math.sqrt(5)) / 2;

  const rawVerts = [
    [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
    [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
    [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1],
  ];

  const normalize = ([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [x / len * radius, y / len * radius, z / len * radius];
  };

  let vertices = rawVerts.map(normalize);

  let faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ];

  const midpointCache = {};
  const getMidpoint = (i1, i2) => {
    const key = [i1, i2].sort().join(',');
    if (midpointCache[key] !== undefined) return midpointCache[key];
    const [v1, v2] = [vertices[i1], vertices[i2]];
    const mid = normalize([
      (v1[0] + v2[0]) / 2,
      (v1[1] + v2[1]) / 2,
      (v1[2] + v2[2]) / 2,
    ]);
    const index = vertices.length;
    vertices.push(mid);
    midpointCache[key] = index;
    return index;
  };

  // Estimate subdivisions
  let subdivisions = 0;
  while ((10 * 4 ** subdivisions + 2) < targetCount) {
    subdivisions++;
  }

  for (let s = 0; s < subdivisions; s++) {
    const newFaces = [];
    for (const [a, b, c] of faces) {
      const ab = getMidpoint(a, b);
      const bc = getMidpoint(b, c);
      const ca = getMidpoint(c, a);
      newFaces.push([a, ab, ca]);
      newFaces.push([b, bc, ab]);
      newFaces.push([c, ca, bc]);
      newFaces.push([ab, bc, ca]);
    }
    faces = newFaces;
  }

  const pointList = vertices.map(([x, y, z]) => ({ x, y, z }));
  return {
    points: pointList,
    triangles: faces, // list of [index1, index2, index3] into points
  };
}


function generateLatLongSphereMesh(targetCount = 100, radius = 1) {
  // Roughly balance lat/lon based on target count
  const lonCount = Math.ceil(Math.sqrt(targetCount));
  const latCount = Math.ceil(targetCount / lonCount) - 1; // +1 because equator = extra ring

  const points = [];

  // Latitude from 0 (north pole) to PI (south pole)
  for (let lat = 0; lat <= latCount; lat++) {
    const theta = (lat * Math.PI) / latCount;
    const y = Math.cos(theta); // y = cos(theta)
    const r = Math.sin(theta); // horizontal radius at this latitude

    for (let lon = 0; lon < lonCount; lon++) {
      const phi = (lon * 2 * Math.PI) / lonCount;

      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;

      points.push({ x: x * radius, y: y * radius, z: z * radius });
    }
  }

  const triangles = [];

  for (let lat = 0; lat < latCount; lat++) {
    for (let lon = 0; lon < lonCount; lon++) {
      const current = lat * lonCount + lon;
      const next = current + lonCount;

      const nextLon = (lon + 1) % lonCount;

      const a = current;
      const b = lat * lonCount + nextLon;
      const c = next;
      const d = next + nextLon - lon;

      triangles.push([a, b, c]);
      triangles.push([c, b, d]);
    }
  }

  return {
    points,
    triangles,
  };
}


function generateLatLongEquatorialFocusSphere(targetCount = 100, radius = 1) {
  const latCount = Math.ceil(Math.sqrt(targetCount)); // choose a reasonable vertical resolution
  const points = [];
  const triangles = [];
  const ringStart = [];

  let pointIndex = 0;

  for (let lat = 0; lat <= latCount; lat++) {
    const theta = (lat * Math.PI) / latCount; // polar angle
    const y = Math.cos(theta);                // vertical
    const r = Math.sin(theta);                // horizontal radius

    // Scale number of points in this ring based on sin(theta)
    const ringCount = Math.max(3, Math.round(Math.sin(theta) * latCount * 2));
    ringStart.push(pointIndex);

    for (let lon = 0; lon < ringCount; lon++) {
      const phi = (lon * 2 * Math.PI) / ringCount;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      points.push({ x: x * radius, y: y * radius, z: z * radius });
      pointIndex++;
    }
  }

  // Generate triangles between adjacent rings
  for (let lat = 0; lat < latCount; lat++) {
    const currStart = ringStart[lat];
    const nextStart = ringStart[lat + 1];

    const currCount = ringStart[lat + 1] - currStart;
    const nextCount = ringStart[lat + 2]
      ? ringStart[lat + 2] - nextStart
      : ringStart[lat + 1] - nextStart; // Last ring handling

    for (let i = 0; i < currCount; i++) {
      const a = currStart + i;
      const b = currStart + (i + 1) % currCount;

      const ratio = nextCount / currCount;
      const j = Math.floor(i * ratio);
      const k = Math.floor((i + 1) * ratio);

      const c = nextStart + j;
      const d = nextStart + (k % nextCount);

      triangles.push([a, b, c]);
      if (c !== d) triangles.push([b, d, c]);
    }
  }

  return {
    points,
    triangles,
  };
}


function generateFibonacciSphereMesh(pointCount = 100, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.399

  for (let i = 0; i < pointCount; i++) {
    const y = 1 - (i / (pointCount - 1)) * 2; // y from 1 to -1
    const r = Math.sqrt(1 - y * y);          // horizontal radius
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    points.push({ x: x * radius, y: y * radius, z: z * radius });
  }

  // Nearest neighbor triangulation (approximate, not watertight but fast)
  const triangles = [];
  for (let i = 1; i < pointCount - 1; i++) {
    triangles.push([i - 1, i, i + 1]);
  }

  return { points, triangles };
}
