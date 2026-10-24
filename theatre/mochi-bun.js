/*
title: Mochi Bun
category: cute
files:
    head
    ../point_src/stage.js
---

A tiny kawaii steamed bun: soft, white, and squishy. Move the pointer near it; click to make it bounce and blush.
*/
class MainStage extends Stage {
  canvas = 'playspace'
  mounted() {
    this.time=0;this.squish=0;this.pointer={x:-999,y:-999};
    this.canvas.addEventListener('pointermove',e=>{
      const r=this.canvas.getBoundingClientRect();
      this.pointer.x=(e.clientX-r.left)*this.canvas.width/r.width;
      this.pointer.y=(e.clientY-r.top)*this.canvas.height/r.height;
    });
    this.canvas.addEventListener('pointerleave',()=>{this.pointer.x=-999;this.pointer.y=-999;});
    this.canvas.addEventListener('pointerdown',()=>{this.squish=1;});
  }
  draw(ctx){
    const w=this.canvas.width,h=this.canvas.height;
    this.time+=.045;this.squish*=.92;
    ctx.clearRect(0,0,w,h);
    const scale=Math.min(w,h)/350;
    const cx=w/2,cy=h*.54;
    const nearby=Math.hypot(this.pointer.x-cx,this.pointer.y-cy)<130*scale;
    const bounce=Math.sin(this.time*2)*3+Math.abs(Math.sin(this.time*10))*25*this.squish;
    ctx.save();ctx.translate(cx,cy-bounce*scale);ctx.scale(scale,scale);
    // small oval shadow
    ctx.fillStyle='rgba(119,90,89,.12)';
    ctx.beginPath();ctx.ellipse(0,118+bounce,100-12*this.squish,15,0,0,Math.PI*2);ctx.fill();
    // plump round white dumpling
    ctx.translate(0,20*this.squish);
    ctx.scale(1+this.squish*.13,1-this.squish*.2);
    ctx.shadowColor='rgba(125,105,115,.18)';ctx.shadowBlur=24;ctx.shadowOffsetY=8;
    const grad=ctx.createRadialGradient(-40,-65,12,5,4,150);
    grad.addColorStop(0,'#ffffff');grad.addColorStop(.68,'#fffefd');grad.addColorStop(1,'#e8dfe0');
    ctx.fillStyle=grad;ctx.beginPath();
    ctx.moveTo(-109,51);
    ctx.bezierCurveTo(-130,0,-107,-109,-25,-114);
    ctx.bezierCurveTo(49,-132,120,-77,116,25);
    ctx.bezierCurveTo(120,89,69,106,2,107);
    ctx.bezierCurveTo(-66,108,-103,94,-109,51);
    ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    // two miniature dot eyes
    ctx.fillStyle='#39343a';
    for(const ex of [-39,39]){
      ctx.beginPath();ctx.ellipse(ex,-4,6.5,8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='white';ctx.beginPath();ctx.arc(ex-2,-7,1.8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#39343a';
    }
    // warm pink blush
    ctx.fillStyle=nearby||this.squish>.05?'#f5b4c2':'#f9d4db';
    for(const x of [-72,72]){
      ctx.beginPath();ctx.ellipse(x,23,17,9,0,0,Math.PI*2);ctx.fill();
    }
    // teeny mouth, surprised when poked
    ctx.strokeStyle='#514047';ctx.lineWidth=3;ctx.lineCap='round';
    if(this.squish>.16){
      ctx.fillStyle='#704b59';ctx.beginPath();ctx.ellipse(0,24,6,9,0,0,Math.PI*2);ctx.fill();
    } else {
      ctx.beginPath();ctx.moveTo(-8,20);ctx.quadraticCurveTo(0,30,8,20);ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle='#aeb4c6';ctx.textAlign='center';
    ctx.font='14px sans-serif';ctx.fillText('a very small bun  ♡  (poke me!)',cx,h-23);
  }
}
stage = MainStage.go();