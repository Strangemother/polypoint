/*
title: Interactive 5D Penteract
category: geometry
files:
    head
    point
    stage
---
Five-dimensional hypercube: 32 vertices and 80 edges. Drag to rotate in 5D; tap to pause.
*/
class MainStage extends Stage {
 canvas="playspace"
 mounted(){
  this.angles=[0,0,0,0];this.auto=true;this.drag=null;
  this.vertices=Array.from({length:32},(_,i)=>Array.from({length:5},(_,k)=>(i&(1<<k))?1:-1));
  this.edges=[];
  for(let i=0;i<32;i++)for(let k=0;k<5;k++)if(!(i&(1<<k)))this.edges.push([i,i|(1<<k)]);
  this.canvas.style.touchAction="none";
  this.canvas.addEventListener("pointerdown",e=>{this.drag={x:e.clientX,y:e.clientY,moved:false};this.canvas.setPointerCapture(e.pointerId)});
  this.canvas.addEventListener("pointermove",e=>{if(!this.drag)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.abs(dx)+Math.abs(dy)>2)this.drag.moved=true;this.angles[0]+=dx*.008;this.angles[1]+=dy*.008;this.drag.x=e.clientX;this.drag.y=e.clientY});
  this.canvas.addEventListener("pointerup",()=>{if(this.drag&&!this.drag.moved)this.auto=!this.auto;this.drag=null});
 }
 rotate(v,i,j,a){const c=Math.cos(a),s=Math.sin(a),x=v[i],y=v[j];v[i]=x*c-y*s;v[j]=x*s+y*c}
 draw(ctx){
  this.clear(ctx);
  const w=this.canvas.width,h=this.canvas.height,cx=w/2,cy=h/2;
  if(this.auto){this.angles[0]+=.007;this.angles[1]+=.005;this.angles[2]+=.004;this.angles[3]+=.003}
  this.angles=this.angles.map(a=>a%(Math.PI*20));
  const pts=this.vertices.map(p=>{
   const v=p.slice();
   this.rotate(v,0,4,this.angles[0]);this.rotate(v,1,4,this.angles[1]);
   this.rotate(v,2,4,this.angles[2]);this.rotate(v,3,4,this.angles[3]);
   this.rotate(v,0,3,this.angles[2]*.7);this.rotate(v,1,2,this.angles[0]*.5);
   const f5=8/(8-v[4]);const u=v.slice(0,4).map(x=>x*f5);
   const f4=8/(8-u[3]);const x=u[0]*f4,y=u[1]*f4,z=u[2]*f4;
   const f3=9/(9-z);
   return [x*f3,y*f3,z];
  });
  let bound=1;for(const p of pts)bound=Math.max(bound,Math.abs(p[0]),Math.abs(p[1]));
  const scale=Math.min(w*.37,h*.34)/bound;
  ctx.lineWidth=Math.max(1.2,Math.min(w,h)/360);
  for(const [i,j] of this.edges){const a=pts[i],b=pts[j];ctx.strokeStyle="rgba(100,190,255,.72)";ctx.beginPath();ctx.moveTo(cx+a[0]*scale,cy+a[1]*scale);ctx.lineTo(cx+b[0]*scale,cy+b[1]*scale);ctx.stroke()}
  // Trace one original 3D cube (vertices 0 through 7).
  ctx.lineWidth=3;
  for(const [i,j] of this.edges) {
    if(i<8 && j<8) {
      const a=pts[i],b=pts[j];
      ctx.strokeStyle="#ffb43b";
      ctx.beginPath();
      ctx.moveTo(cx+a[0]*scale,cy+a[1]*scale);
      ctx.lineTo(cx+b[0]*scale,cy+b[1]*scale);
      ctx.stroke();
    }
  }
  for(const p of pts){ctx.fillStyle="#ffd68c";ctx.beginPath();ctx.arc(cx+p[0]*scale,cy+p[1]*scale,Math.max(1.8,scale*.026),0,Math.PI*2);ctx.fill()}
  ctx.fillStyle="#e6f1ff";ctx.font="bold 18px sans-serif";ctx.fillText("5D PENTERACT",14,30);ctx.font="13px sans-serif";
  ctx.fillText("32 vertices · 80 edges",14,52);ctx.fillText("Drag: rotate  •  Tap: pause / play",14,h-18);
 }
}
const stage=MainStage.go()