
function generateCubeShellPoints(countPerAxis = 3, size = 1) {
  const points = [];
  const step = size / (countPerAxis - 1);
  const offset = -size / 2;

  for (let xi = 0; xi < countPerAxis; xi++) {
    for (let yi = 0; yi < countPerAxis; yi++) {
      for (let zi = 0; zi < countPerAxis; zi++) {
        const isSurface =
          xi === 0 || xi === countPerAxis - 1 ||
          yi === 0 || yi === countPerAxis - 1 ||
          zi === 0 || zi === countPerAxis - 1;

        if (isSurface) {
          const x = offset + xi * step;
          const y = offset + yi * step;
          const z = offset + zi * step;
          points.push({ x, y, z });
        }
      }
    }
  }

  return points;
}
