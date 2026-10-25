/*
title: Interactive 4D Tesseract
category: geometry
files:
    head
    point
    stage
---
A 4D hypercube: 16 vertices, 32 edges. Drag to rotate it, tap to toggle motion.
*/
class MainStage extends Stage {
 canvas = "playspace"
 mounted() {
   this.a=0; this.b=0; this.c=0; this.auto=true; this.drag=null;
   this.vertices=[];
   for(let i=0;i<16;i++) this.vertices.push([0,1,2,3].map(k=>(i&(1<<k))?1:-1));
   this.edges=[];
   for(let i=0;i<16;i++) for(let k=0;k<4;k++) if(!(i&(1<<k))) this.edges.push([i,i|(1<<k)]);
   this.canvas.style.touchAction="none";
   this.canvas.addEventListener("pointerdown",e=>{this.drag={x:e.clientX,y:e.clientY,moved:false};this.canvas.setPointerCapture(e.pointerId)});
   this.canvas.addEventListener("pointermove",e=>{if(!this.drag)return;let dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.abs(dx)+Math.abs(dy)>2)this.drag.moved=true;this.a+=dx*.008;this.b+=dy*.008;this.drag.x=e.clientX;this.drag.y=e.clientY});
   this.canvas.addEventListener("pointerup",()=>{if(this.drag&&!this.drag.moved)this.auto=!this.auto;this.drag=null});
 }
 rotate(v,i,j,a) {let c=Math.cos(a),s=Math.sin(a),x=v[i],y=v[j];v[i]=x*c-y*s;v[j]=x*s+y*c;}
 draw(ctx) {
   this.clear(ctx);
   let w=this.canvas.width,h=this.canvas.height;
   if(this.auto){this.a+=.009;this.b+=.004;this.c+=.006}
   let scale=Math.min(w,h)*.14,cx=w/2,cy=h/2;
   const points=this.vertices.map(p=>{
     let v=p.slice();
     this.rotate(v,0,3,this.a);
     this.rotate(v,1,3,this.b);
     this.rotate(v,0,2,this.c);
     this.rotate(v,1,2,this.a*.35);
     let f4=2.9/(2.9-v[3]);let x=v[0]*f4,y=v[1]*f4,z=v[2]*f4;
     let f3=3.8/(3.8-z);return [cx+x*f3*scale,cy+y*f3*scale,z];
   });
   ctx.lineWidth=Math.max(1.3,Math.min(w,h)/260);
   for(const [i,j] of this.edges){
     const p=points[i],q=points[j];
     ctx.strokeStyle="rgba(90,180,255,0.85)";
     ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
   }
   for(const p of points){ctx.fillStyle="#ffcf7a";ctx.beginPath();ctx.arc(p[0],p[1],Math.max(2,scale*.025),0,Math.PI*2);ctx.fill()}
   ctx.fillStyle="#e1eaf5";ctx.font=Math.max(13,Math.min(w/24,21))+"px sans-serif";
   ctx.fillText("4D TESSERACT",16,30);
   ctx.font=Math.max(11,Math.min(w/32,16))+"px sans-serif";
   ctx.fillText("16 vertices · 32 edges",16,52);
   ctx.fillText("Drag: rotate  •  Tap: pause / play",16,h-18);
 }
}
const stage=MainStage.go()