// double pendulum math from https://github.com/micaeloliveira/physics-sandbox/blob/feature/new-styling/assets/javascripts/pendulum.js

// canvas settings
var viewWidth = 800,//window.innerWidth,
    viewHeight = 600,//window.innerHeight,
    drawingCanvas = document.getElementById("canvas"),
    ctx,
    timeStep = (1/60),
    time = 0;

// pendulum
var mass1 = 10,
    mass2 = 10,
    mu = 0,
    Theta1 = Math.PI * 0.5,
    Theta2 = Math.PI * 0.5,
    d2Theta1 = 0,
    d2Theta2 = 0,
    dTheta1 = 0,
    dTheta2 = 0,
    length1 = 120,
    length2 = 120,
    anchorX = viewWidth * 0.5,
    anchorY = viewHeight * 0.3,
    g = 9.8;

// physics
var world,
    body0, // anchor
    body1, // top circle
    body2, // bottom circle
    dc1,
    dc2,
    physicsScale = 32;

var mathTimeScale = 5.6;

// graphics
var circ1, circ2, circ3, circ4,
    line1, line2, line3, line4,
    trail1, trail2;

function initDrawingCanvas() {
    drawingCanvas.width = viewWidth;
    drawingCanvas.height = viewHeight;
    ctx = drawingCanvas.getContext('2d');
}

function initGraphics() {
    // math
    circ1 = {x: anchorX + length1 * Math.sin(Theta1), y: anchorY+length1*Math.cos(Theta1), radius: mass1};
    circ2 = {x: anchorX + length1 * Math.sin(Theta1) + length2 * Math.sin(Theta2), y: anchorY + length1 * Math.cos(Theta1) + length2 * Math.cos(Theta2), radius: mass2};
    line1 = {x0: anchorX, y0: anchorY, x: 0, y: 0};
    line2 = {x0: 0, y0: 0, x: 0, y: 0};
    // physics (values will be set by the physics engine)
    circ3 = {x:0, y:0, radius:1};
    circ4 = {x:0, y:0, radius:1};
    line3 = {x0: 0, y0: 0, x: 0, y: 0};
    line4 = {x0: 0, y0: 0, x: 0, y: 0};

    trail1 = [];
    trail2 = [];
}

function initPhysics() {
    world = new p2.World({gravity:[0, -g]});

    var px = anchorX / physicsScale;
    var py = (viewHeight - anchorY) / physicsScale;
    var r1 = mass1 / physicsScale;
    var r2 = mass2 / physicsScale;

    body0 = new p2.Body({mass:0, position:[px, py]});
    px += length1 / physicsScale;

    body1 = new p2.Body({mass:1, position:[px, py]});
    body1.addShape(new p2.Circle(r1));
    px += length2 / physicsScale;

    body2 = new p2.Body({mass:1, position:[px, py]});
    body2.addShape(new p2.Circle(r2));

    dc1 = new p2.DistanceConstraint(body0, body1, {distance:length1 / physicsScale});
    dc2 = new p2.DistanceConstraint(body1, body2, {distance:length2 / physicsScale});

    body1.damping = body2.damping = 0;
    body1.angularDamping = body2.angularDamping = 0;

    world.addBody(body0);
    world.addBody(body1);
    world.addBody(body2);
    world.addConstraint(dc1);
    world.addConstraint(dc2);

    // sync static values between bodies and corresponding graphics
    line3.x0 = body0.position[0];
    line3.y0 = body0.position[1];
    circ3.radius = r1;
    circ4.radius = r2;
}

function update() {
    // MATH
    var dt = timeStep * mathTimeScale;
    mu        =  1 + mass1 / mass2;
    d2Theta1  =  (g*(Math.sin(Theta2)*Math.cos(Theta1-Theta2)-mu*Math.sin(Theta1))-(length2*dTheta2*dTheta2+length1*dTheta1*dTheta1*Math.cos(Theta1-Theta2))*Math.sin(Theta1-Theta2))/(length1*(mu-Math.cos(Theta1-Theta2)*Math.cos(Theta1-Theta2)));
    d2Theta2  =  (mu*g*(Math.sin(Theta1)*Math.cos(Theta1-Theta2)-Math.sin(Theta2))+(mu*length1*dTheta1*dTheta1+length2*dTheta2*dTheta2*Math.cos(Theta1-Theta2))*Math.sin(Theta1-Theta2))/(length2*(mu-Math.cos(Theta1-Theta2)*Math.cos(Theta1-Theta2)));
    dTheta1   += d2Theta1 * dt;
    dTheta2   += d2Theta2 * dt;
    Theta1    += dTheta1 * dt;
    Theta2    += dTheta2 * dt;

    circ1.x = anchorX+length1*Math.sin(Theta1);
    circ1.y = anchorY+length1*Math.cos(Theta1);
    circ2.x = anchorX+length1*Math.sin(Theta1)+length2*Math.sin(Theta2);
    circ2.y = anchorY+length1*Math.cos(Theta1)+length2*Math.cos(Theta2);

    line1.x  = circ1.x;
    line1.y  = circ1.y;
    line2.x0 = circ1.x;
    line2.y0 = circ1.y;
    line2.x  = circ2.x;
    line2.y  = circ2.y;

    trail1.unshift({x:circ2.x, y:circ2.y});
    if (trail1.length > 2048) trail1.pop();

    // PHYSICS
    world.step(timeStep);

    circ3.x = body1.position[0];
    circ3.y = body1.position[1];
    circ4.x = body2.position[0];
    circ4.y = body2.position[1];

    line3.x  = circ3.x;
    line3.y  = circ3.y;
    line4.x0 = circ3.x;
    line4.y0 = circ3.y;
    line4.x  = circ4.x;
    line4.y  = circ4.y;

    trail2.unshift({x:circ4.x, y:circ4.y});
    if (trail2.length > 2048) trail2.pop();
}

function draw() {
    // clear
    ctx.clearRect(0, 0, viewWidth, viewHeight);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(anchorX, anchorY, 5, 0, Math.PI * 2);
    ctx.fill();

    // MATH
    ctx.globalCompositeOperation = 'destination-over';
    ctx.strokeStyle = '#fff';
        drawLine(line1);
        drawLine(line2);
    ctx.strokeStyle = '#f0f';
        drawTrail(trail1);
    ctx.fillStyle = '#f0f';
    ctx.globalCompositeOperation = 'source-over';
        drawCircle(circ1);
        drawCircle(circ2);

    // PHYSICS
    ctx.save();
    ctx.translate(0, viewHeight);
    ctx.scale(physicsScale, -physicsScale);

    ctx.globalCompositeOperation = 'destination-over';
    ctx.lineWidth = 1 / physicsScale;
    ctx.strokeStyle = '#fff';
        drawLine(line3);
        drawLine(line4);
    ctx.strokeStyle = '#0ff';
        drawTrail(trail2);
    ctx.fillStyle = '#0ff';
    ctx.globalCompositeOperation = 'source-over';
        drawCircle(circ3);
        drawCircle(circ4);

    ctx.restore();
}

function drawCircle(c) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI, false);
    ctx.fill();
}

function drawLine(l) {
    ctx.beginPath();
    ctx.moveTo(l.x0, l.y0);
    ctx.lineTo(l.x, l.y);
    ctx.stroke();
}

function drawTrail(t) {
    ctx.beginPath();
    ctx.moveTo(t[0].x, t[0].y);

    for (var i = 1; i < t.length; i++) {
        ctx.lineTo(t[i].x, t[i].y);
    }

    ctx.stroke();
}

window.onload = function() {
    initDrawingCanvas();
    initGraphics();
    initPhysics();
    requestAnimationFrame(loop);
};

function loop() {
    update();
    draw();
    time += timeStep;
    requestAnimationFrame(loop);
}

// GUI
// var dat = new dat.GUI();
var settings = {
    length1:120,
    length2:120,
    mass1:10,
    mass2:10,
    mathTimeScale:5.6,
    apply:function() {

        length1 = this.length1;
        length2 = this.length2;
        mass1 = this.mass1;
        mass2 = this.mass2;
        mathTimeScale = this.mathTimeScale;
        Theta1 = Math.PI * 0.5;
        Theta2 = Math.PI * 0.5;
        d2Theta1 = 0;
        d2Theta2 = 0;
        dTheta1 = 0;
        dTheta2 = 0;
        world.removeBody(body0);
        world.removeBody(body1);
        world.removeBody(body2);
        world.removeConstraint(dc1);
        world.removeConstraint(dc2);

        initGraphics();
        initPhysics();
    }
};

// dat.add(settings, 'length1', 10, 200);
// dat.add(settings, 'length2', 10, 200);
// dat.add(settings, 'mass1', 1, 30);
// dat.add(settings, 'mass2', 1, 30);
// dat.add(settings, 'mathTimeScale', 1, 10);
// dat.add(settings, 'apply');
// dat.close();
