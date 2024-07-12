var canvas = document.querySelector('#engines'),
  ctx = canvas.getContext('2d');
var trailCanvas = document.querySelector("#trails"),
  trailCtx = trailCanvas.getContext('2d');

function animLoop(render) {
  var running, lastFrame = +new Date;
  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  function loop(now) {
    if (running !== false) {
      requestAnimFrame(loop);
      running = render(now - lastFrame);
      lastFrame = now;
    }
  }
  loop(lastFrame);
};

function drawDot(x, y, color, ctx) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
};

var getTrailColor = (function() {
  var blue = 200,
    dir = -1;
  return function() {
    blue += dir;
    if (blue === 100) {
      dir = 1;
    } else if (blue === 200) {
      dir = -1;
    }
    return 'rgba(255,105,' + blue + ',.5)';
  };
})();

// 5 petals flower
var engines = [
  {x: 250, y: 75, r: 60, a: 3 * Math.PI / 4, s: Math.PI / 200},
  {x: 350, y: 300, r: 100, a: -Math.PI / 4, s: -Math.PI / 50}
];

// 8 petals
/*var engines = [
  {x: 300, y: 300, r: 200, a: Math.PI / 4, s: Math.PI / 50},
  {x: 300, y: 300, r: 200, a: -Math.PI / 4, s: -Math.PI / 30}
];*/

// 4 circles
/*var engines = [
  {x: 150, y: 300, r: 150, a: Math.PI, s: Math.PI / 100},
  {x: 300, y: 150, r: 150, a: -Math.PI/2, s: Math.PI / 100},
  {x: 450, y: 300, r: 150, a: 2*Math.PI, s: Math.PI / 100},
  {x: 300, y: 450, r: 150, a: Math.PI/2, s: Math.PI / 100}
];*/

// rosace
/*var engines = [];
for (var i = 0; i < 2 * Math.PI; i += Math.PI / 16) {
  engines.push({
    x: 300 + (150 * Math.cos(i)),
    y: 300 + (150 * Math.sin(i)),
    r: 100,
    a: i,
    s: Math.PI / 100
  });
}*/

animLoop(function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var linksCoordinates = [];

  // Engines
  ctx.strokeStyle = 'rgba(255,255,255,.5)';
  ctx.lineWidth = 2;
  engines.forEach(function(engine) {
    var posX = engine.x + (engine.r * Math.cos(engine.a)),
      posY = engine.y + (engine.r * Math.sin(engine.a));

    ctx.beginPath();
    ctx.moveTo(engine.x, engine.y);
    ctx.lineTo(posX, posY);
    ctx.closePath();
    ctx.stroke();

    drawDot(engine.x, engine.y, 'rgba(255,255,255,.5)', ctx);
    drawDot(posX, posY, 'rgba(255,255,255,.5)', ctx);

    engine.a += engine.s;

    linksCoordinates.push({
      x: posX,
      y: posY
    });
  });

  // Links
  ctx.strokeStyle = 'rgba(255,105,180,.5)';
  ctx.beginPath();
  ctx.moveTo(linksCoordinates[0].x, linksCoordinates[0].y);
  linksCoordinates.forEach(function(point, index) {
    if (index !== 0) {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.stroke();

  // Links mid-points
  linksCoordinates.forEach(function(point, index, points) {
    var start = point,
      end = points[index + 1] || points[0];
    var midX = (start.x + end.x) / 2,
      midY = (start.y + end.y) / 2;
    drawDot(midX, midY, 'red', ctx);
    drawDot(midX, midY, getTrailColor(), trailCtx);
  });
});