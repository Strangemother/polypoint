/*
title: Wave Function Collapse Rotating 3D Cube
category: geometry
files:
    head
    point
    stage
    ../point_src/stage.js
    dragging
    pointlist
    mouse
---
5 x 5 x 5 socket-constrained tiles. Rotating projected lattice, visible resolution and connections.
*/
const N=5, TOTAL=125;
const D=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]], OP=[1,0,3,2,5,4];
const tiles=Array.from({length:64},(_,i)=>i);
function xyz(i){return [i%5,Math.floor(i/5)%5,Math.floor(i/25)];}
function neighbor(i,d){const p=xyz(i),v=D[d],x=p[0]+v[0],y=p[1]+v[1],z=p[2]+v[2];return x<0||x>=5||y<0||y>=5||z<0||z>=5?-1:x+5*y+25*z;}
class CubeStage extends Stage{
canvas='playspace';
mounted(){
this.reset();
this.canvas.addEventListener('click',()=>this.reset());
window.addEventListener('keydown',e=>{if(e.code==='Space'){this.paused=!this.paused;e.preventDefault();}});
}
reset(){
this.cells=Array.from({length:TOTAL},()=>tiles.slice());
this.steps=0;this.completed=false;this.dead=false;this.paused=false;this.last=0;this.angle=0;this.propagate();
}
propagate(){
const queue=Array.from({length:TOTAL},(_,i)=>i);
let cursor=0;
while(cursor<queue.length){
if(cursor>20000){this.dead=true;return;}
const i=queue[cursor++];
for(let d=0;d<6;d++){
const j=neighbor(i,d);
if(j<0){const keep=this.cells[i].filter(t=>!(t&(1<<d)));if(keep.length!==this.cells[i].length){this.cells[i]=keep;for(let k=0;k<6;k++){const nb=neighbor(i,k);if(nb>=0)queue.push(nb);}}}
else {
const permitted=this.cells[i].filter(t=>this.cells[j].some(u=>!!(t&(1<<d))===!!(u&(1<<OP[d]))));
if(permitted.length!==this.cells[i].length){this.cells[i]=permitted;for(let k=0;k<6;k++){const nb=neighbor(i,k);if(nb>=0)queue.push(nb);}}
}
if(!this.cells[i].length){this.dead=true;return;}
}
}
}
step(){
if(this.completed||this.dead)return;
const possible=[];
let best=Infinity;
for(let i=0;i<TOTAL;i++){const n=this.cells[i].length;if(n>1){if(n<best){best=n;possible.length=0;}if(n===best)possible.push(i);}}
if(!possible.length){this.completed=true;return;}
const i=possible[Math.floor(Math.random()*possible.length)];
this.cells[i]=[this.cells[i][Math.floor(Math.random()*this.cells[i].length)]];
this.steps++;this.propagate();
if(this.cells.every(c=>c.length===1))this.completed=true;
}
project(p,w,h,scale){
const x=p[0]-2,y=p[1]-2,z=p[2]-2;
// Three simultaneous Euler-axis rotations at different speeds.
const ax=this.angle*.71,ay=this.angle,az=this.angle*.39;
const sx=Math.sin(ax),cx=Math.cos(ax);
const sy=Math.sin(ay),cy=Math.cos(ay);
const sz=Math.sin(az),cz=Math.cos(az);
// Rotate around X, then Y, then Z.
const y1=y*cx-z*sx,z1=y*sx+z*cx;
const xr=x*cy+z1*sy,zr=-x*sy+z1*cy;
const yr=xr*sz+y1*cz,screenX=xr*cz-y1*sz;
const depth=zr;
const perspective=7.5/(7.5+depth*.12);
return {x:w/2+screenX*scale*perspective,y:h/2+18+yr*scale*perspective,depth};
}
draw(ctx){
const w=this.canvas.width,h=this.canvas.height;
ctx.fillStyle='#0b1320';ctx.fillRect(0,0,w,h);
this.angle+=.004;
if(!this.paused&&!this.completed&&performance.now()-this.last>130){if(this.dead)this.reset();else this.step();this.last=performance.now();}
ctx.textAlign='center';ctx.fillStyle='#e5f9ff';ctx.font='bold 20px sans-serif';ctx.fillText('3D WAVE FUNCTION COLLAPSE',w/2,34);
ctx.font='14px sans-serif';ctx.fillStyle='#a2b8cc';
const settled=this.cells.filter(v=>v.length===1).length;
ctx.fillText(settled+'/125 cells resolved  ·  '+this.steps+' choices  ·  '+(this.completed?'complete':this.paused?'paused':'collapsing'),w/2,58);
ctx.fillText('Click to regenerate · Space to pause',w/2,h-18);
const scale=Math.min(w*.115,(h-130)*.12);
const points=Array.from({length:TOTAL},(_,i)=>this.project(xyz(i),w,h,scale));
const depthOrder=Array.from({length:TOTAL},(_,i)=>i).sort((a,b)=>points[b].depth-points[a].depth);
ctx.lineWidth=1;ctx.strokeStyle='rgba(93,129,151,0.12)';
for(let i=0;i<TOTAL;i++)for(const d of [0,2,4]){const j=neighbor(i,d);if(j<0)continue;ctx.beginPath();ctx.moveTo(points[i].x,points[i].y);ctx.lineTo(points[j].x,points[j].y);ctx.stroke();}
const segments=[];
for(let i=0;i<TOTAL;i++){
const opts=this.cells[i];if(opts.length!==1)continue;
const tile=opts[0];
for(let d=0;d<6;d++)if(tile&(1<<d)){
const j=neighbor(i,d);if(j<0)continue;
if(i<j&&this.cells[j].length===1){const a=points[i],b=points[j];segments.push({a,b,depth:(a.depth+b.depth)/2});}
else if(this.cells[j].length!==1){const p=xyz(i),v=D[d],q=this.project([p[0]+v[0]*.46,p[1]+v[1]*.46,p[2]+v[2]*.46],w,h,scale);segments.push({a:points[i],b:q,depth:points[i].depth});}
}
}
segments.sort((a,b)=>b.depth-a.depth);
for(const s of segments){ctx.strokeStyle='rgba(101,231,215,0.8)';ctx.lineWidth=Math.max(2,scale*.14);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s.a.x,s.a.y);ctx.lineTo(s.b.x,s.b.y);ctx.stroke();}
for(const i of depthOrder){
const p=points[i],n=this.cells[i].length;
ctx.beginPath();ctx.arc(p.x,p.y,n===1?Math.max(3,scale*.13):Math.max(1.5,scale*.06),0,Math.PI*2);
ctx.fillStyle=n===1?'#bafff0':'rgba(122,151,189,0.22)';ctx.fill();
}
}
}
const stage=CubeStage.go();