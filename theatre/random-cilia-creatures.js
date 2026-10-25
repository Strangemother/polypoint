/*
title: Random Cilia Creatures
category: animation
files:
    head
    ../point_src/point.js
    ../point_src/stage.js
---
Random blob, 1 to 6 patches with 2 to 15 articulated cilia each.
Arrow keys control propulsion and turning. R regenerates the creature.
*/
class MainStage extends Stage {
 canvas="playspace"
 init(w,h) {
  this.x=w/2;this.y=h/2;this.vx=0;this.vy=0;this.angle=0;this.omega=0;this.t=0;
  this.keys={};this.last=performance.now();this.randomise();
  if(!this.bound){
   this.down=e=>{if(e.key==="r"||e.key==="R"){this.randomise();e.preventDefault()}
    if(e.key.startsWith("Arrow")){this.keys[e.key]=true;e.preventDefault()}};
   this.up=e=>{if(e.key.startsWith("Arrow")){this.keys[e.key]=false;e.preventDefault()}};
   window.addEventListener("keydown",this.down);window.addEventListener("keyup",this.up);this.bound=true;
  }
 }
 randomise(){
  this.lobes=Array.from({length:7},()=>Math.random()*2-1);
  // Different silhouettes: round, slim, bean, kidney, irregular.
  this.bodyType=Math.floor(Math.random()*5);
  this.scaleX=[1,1.45,1.4,1.35,.85][this.bodyType]*(0.95+Math.random()*.15);
  this.scaleY=[1,.48,.66,.7,1.1][this.bodyType]*(0.92+Math.random()*.16);
  this.concavity=this.bodyType===3?.30:this.bodyType===2?.13:0;
  const n=1+Math.floor(Math.random()*6);
  this.patches=Array.from({length:n},(_,p)=>{
   const count=2+Math.floor(Math.random()*14),a=Math.random()*Math.PI*2,spacing=.025+Math.random()*.11;
   return {strength:.65+Math.random()*.35,hairs:Array.from({length:count},(_,i)=>({
    a:a+(i-(count-1)/2)*spacing,phase:i*.42,len:29+Math.random()*22,bias:(Math.random()-.5)*1.8,curve:(Math.random()-.5)*1.3,
    act:0,nodes:Array.from({length:6},()=>({x:0,y:0}))
   }))};
  });
 }
 shape(a) {
  let r=66;
  for(let j=0;j<this.lobes.length;j++)r+=this.lobes[j]*3*Math.sin(a*(j+2)+j*.65);
  if(this.concavity)r*=1-this.concavity*Math.pow(Math.max(0,Math.sin(a)),6);
  return r;
 }
 bodyPoint(a){
  const r=this.shape(a);
  return {x:Math.cos(a)*r*this.scaleX,y:Math.sin(a)*r*this.scaleY};
 }
 draw(ctx){
  const w=ctx.canvas.width,h=ctx.canvas.height;if(!this.patches)this.init(w,h);
  const now=performance.now(),dt=Math.min(2,Math.max(.1,(now-this.last)/16.67));this.last=now;this.t+=dt*.068;
  const turn=(this.keys.ArrowRight?1:0)-(this.keys.ArrowLeft?1:0);
  const travel=(this.keys.ArrowUp?1:0)-(this.keys.ArrowDown?1:0);
  const fx0=Math.cos(this.angle),fy0=Math.sin(this.angle);
  let fx=0,fy=0,tau=0;
  ctx.fillStyle="#081724";ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);ctx.scale(.2,.2);
  ctx.beginPath();
  for(let j=0;j<=200;j++){const a=j*Math.PI*2/200,v=this.bodyPoint(a);j?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y)}
  ctx.closePath();ctx.fillStyle="rgba(78,197,173,.4)";ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle="#89ebd6";ctx.stroke();
  ctx.beginPath();ctx.ellipse(9,-4,20,16,0,0,Math.PI*2);ctx.fillStyle="#337e7866";ctx.fill();
  let count=0;
  for(let p=0;p<this.patches.length;p++)for(const c of this.patches[p].hairs){
   count++;
   const a=c.a,nx=Math.cos(a),ny=Math.sin(a),tx=-ny,ty=nx;
   const target=(turn||travel)?this.patches[p].strength:0;
   c.act+=(target-c.act)*Math.min(1,dt*.13);
   const cycle=((this.t*3.2+c.phase)/(2*Math.PI)%1+1)%1;
   const power=cycle<.64,q=power?cycle/.64:(cycle-.64)/.36;
   const smooth=q*q*(3-2*q),swing=power?-1+2*smooth:1-2*smooth;
   const dir=turn?Math.sign(turn):travel?Math.sign(travel):1;
   const idle=c.bias+.14*Math.sin(this.t*.9+c.phase);
   const bend=idle*(1-c.act)+dir*swing*c.act*.95;
   const curl=power?0:Math.sin(Math.PI*q)*.7*c.act;
   const anchor=this.bodyPoint(a),bx=anchor.x,by=anchor.y,len=c.len;
   c.nodes[0].x=bx;c.nodes[0].y=by;
   ctx.beginPath();ctx.moveTo(bx,by);
   for(let j=1;j<=5;j++){
    const u=j/5,ang=a+bend*(1-u*.2)+c.curve*u*u*(1-c.act);
    const px=bx+Math.cos(ang)*len*u+tx*curl*Math.sin(Math.PI*u)*7;
    const py=by+Math.sin(ang)*len*u+ty*curl*Math.sin(Math.PI*u)*7;
    const node=c.nodes[j];if(!node.x&&!node.y){node.x=px;node.y=py}
    node.x+=(px-node.x)*Math.min(1,dt*.35);node.y+=(py-node.y)*Math.min(1,dt*.35);
    ctx.lineTo(node.x,node.y);
   }
   ctx.lineWidth=3.5;ctx.lineJoin="round";ctx.lineCap="round";
   ctx.strokeStyle=["#b5ffe0","#96d8ff","#ffdf9b","#dcafff","#ffc1c1","#c8ff92"][p];ctx.stroke();
   const impulse=c.act*(power?Math.sin(Math.PI*q)**2:0)*.7;
   const localX=impulse*travel,localY=0;
   fx+=localX*fx0-localY*fy0;fy+=localX*fy0+localY*fx0;
   tau+=turn*impulse*.75+(bx*localY-by*localX)/66*.15;
  }
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(46,0);ctx.strokeStyle="#ffda83";ctx.lineWidth=2;ctx.stroke();
  ctx.restore();
  this.omega=(this.omega+tau*.001*dt)*.96;
  this.omega=Math.max(-.05,Math.min(.05,this.omega));this.angle+=this.omega*dt;
  this.vx=(this.vx+fx*.006*dt)*.965;this.vy=(this.vy+fy*.006*dt)*.965;
  const speed=Math.hypot(this.vx,this.vy);if(speed>2.5){this.vx*=2.5/speed;this.vy*=2.5/speed}
  this.x=Math.max(25,Math.min(w-25,this.x+this.vx*dt*.2));
  this.y=Math.max(25,Math.min(h-25,this.y+this.vy*dt*.2));
  ctx.font="13px sans-serif";ctx.fillStyle="#d8f3ed";
  ctx.fillText(this.patches.length+" patches, "+count+" cilia | Up/Down: swim | Left/Right: turn | R: regenerate",15,24);
 }
}
const stage=MainStage.go();