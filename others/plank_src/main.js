

const { World, Testbed } = planck;
const Vec2 = planck.Vec2
const Box = planck.Box
const Edge = planck.Edge

const world = new World({
  gravity: Vec2(0, -10),
  allowSleep: true,
});
const testbed = Testbed.mount();
testbed.start(world);

let platform = world.createBody({
    type: "static",
    position: new Vec2(0.0, -10.0),
    // angle: Math.PI * 0.1
});

platform.createFixture({
  shape: new Edge(new Vec2(-50, 0), new Vec2(+50, 0)),
});

let body = world.createBody({
    type: "dynamic",
    position: new Vec2(0.0, 4.0),
    gravity: 1
});

body.createFixture({
    shape: new Box(1.0, 1.0),
    density: 1.0,
    friction: 0.3,
});


testbed.step = function(){
 // Thrust: add some force in the ship direction
  if (testbed.activeKeys.up) {
    var f = body.getWorldVector(Vec2(0.0, 1.0));
    var p = body.getWorldPoint(Vec2(0.0, 2.0));
    body.applyLinearImpulse(f, p, true);
  }

    // Set velocities
    if (testbed.activeKeys.left && !testbed.activeKeys.right) {
        body.applyAngularImpulse(0.1, true);
    } else if (testbed.activeKeys.right && !testbed.activeKeys.left) {
        body.applyAngularImpulse(-0.1, true);
    }
}


