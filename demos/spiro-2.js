// import { Pane } from "https://cdn.skypack.dev/tweakpane@3";
// import * as d3 from "https://cdn.skypack.dev/d3@7";
// import "https://codepen.io/handsomeone/pen/KgqaAO.js";

const width = innerWidth;
const height = innerHeight;

const canvases = Array.from(document.querySelectorAll("canvas"));

canvases.forEach((canvas) => {
  canvas.width = width;
  canvas.height = height;
});

const ctxes = canvases.map((canvas) => canvas.getContext("2d"));

ctxes.forEach((ctx) => {
  ctx.translate(width / 2, height / 2);
  ctx.lineCap = "round";
});

const { sin, cos, abs, PI } = Math;
const [base, curve, cover] = ctxes;


class Choid {

  constructor() {
    this.R = 256;
    this.r = 180;
    this.arm = 149;
    this.inner = true;
    this.color = true;
    this.fade = false;
    this.setup();
    this.draw();
  }

  setup = () => {
    delete this.lastP;
    base.clearRect(-width / 2, -height / 2, width, height);
    curve.clearRect(-width / 2, -height / 2, width, height);
    cover.clearRect(-width / 2, -height / 2, width, height);
    this._R = this.R;
    this._r = this.inner ? -this.r : this.r;
    this._arm = this.arm;

    this.c = this._R + this._r;
    this.delta = this.c && 4 / this.c;
    this.theta = 0;
    this.phi = 0;
    base.beginPath();
    base.arc(0, 0, this._R, 0, 2 * PI);
    base.strokeStyle = "#7f7f7f";
    base.stroke();
  };

  draw = () => {

    if (this.fade) {
      curve.fade();
    }

    const p = [
      this.c * cos(this.theta) + this._arm * cos(this.phi),
      this.c * sin(this.theta) + this._arm * sin(this.phi)
    ];

    const color = this.color

    cover.clearRect(-width / 2, -height / 2, width, height);
    cover.beginPath();
    cover.arc(
      this.c * cos(this.theta),
      this.c * sin(this.theta),
      abs(this._r),
      0,
      2 * PI
    );
    cover.strokeStyle = color;
    cover.stroke();
    if (this.lastP) {
      curve.beginPath();
      curve.moveTo(...this.lastP);
      curve.lineTo(...p);
      curve.strokeStyle = color;
      curve.stroke();

      cover.beginPath();
      cover.moveTo(this.c * cos(this.theta), this.c * sin(this.theta));
      cover.lineTo(...p);
      cover.strokeStyle = color;
      cover.stroke();
    }
    this.lastP = p;
    this.theta += this.delta;
    this.theta %= 2 * PI;
    this.phi += (1 + this._R / this._r) * this.delta;
    this.phi %= 2 * PI;
    requestAnimationFrame(this.draw);
  };
}

const c = new Choid();
// const pane = new Pane({ title: "Controls" });
// const lastChange = (e) => e.last && c.setup();
// pane.addInput(c, "R", { min: 8, max: 256 }).on("change", lastChange);
// pane.addInput(c, "r", { min: 1, max: 256 }).on("change", lastChange);
// pane.addInput(c, "arm", { min: 0, max: 248 }).on("change", lastChange);
// pane.addInput(c, "inner").on("change", lastChange);
// pane.addInput(c, "color").on("change", lastChange);
// pane.addInput(c, "fade");
