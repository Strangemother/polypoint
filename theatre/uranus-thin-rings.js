/*
title: Uranus in Points
categories: 3d, astronomy, animation
files:
    head
    point
    pointlist
    stage
---
An icy cyan Uranus with thin dark and faint blue inclined point rings.
*/
let saturnSeed=73913;
function sr(){saturnSeed=(Math.imul(saturnSeed,1664525)+1013904223)|0;return (saturnSeed>>>0)/4294967296;}
class MainStage extends Stage {
 canvas='playspace'
 mounted(){
  this.time=0;
  this.pitch=.74;
  this.yaw=0;
  this.roll=.16;
  this.zoom=1;this.shiftX=0;this.shiftY=0;
  const canvas=document.getElementById('playspace');
  if(canvas){
   canvas.style.touchAction='none';
   let drag=null;
   canvas.addEventListener('pointerdown',e=>{
    const box=canvas.getBoundingClientRect();
    const x=(e.clientX-box.left)*canvas.width/box.width;
    const y=(e.clientY-box.top)*canvas.height/box.height;
    const radius=Math.min(canvas.width*.149,canvas.height*.19)*this.zoom;
    const cx=canvas.width*.5+this.shiftX,cy=canvas.height*.48+this.shiftY;
    const d=Math.hypot(x-cx,y-cy);
    drag={x:e.clientX,y:e.clientY,id:e.pointerId,mode:Math.abs(d-radius)<12?'zoom':d<radius?'move':'rotate',radius,d};
    canvas.setPointerCapture(e.pointerId);
   });
   canvas.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(drag.mode==='rotate'){
     this.yaw+=dx*.008;
     this.pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,this.pitch+dy*.008));
    }else if(drag.mode==='move'){
     const b=canvas.getBoundingClientRect();
     this.shiftX+=dx*canvas.width/b.width;
     this.shiftY+=dy*canvas.height/b.height;
    }else{
     this.zoom=Math.max(.35,Math.min(2.7,this.zoom*Math.exp((dx-dy)*.008)));
    }
    drag.x=e.clientX;drag.y=e.clientY;
   });
   const end=e=>{if(drag&&drag.id===e.pointerId)drag=null;};
   canvas.addEventListener('pointerup',end);
   canvas.addEventListener('pointercancel',end);
   canvas.addEventListener('wheel',e=>{
    e.preventDefault();
    this.zoom=Math.max(.35,Math.min(2.7,this.zoom*Math.exp(-e.deltaY*.001)));
   },{passive:false});
  }
  this.rings=[];
  this.stars=[];
  // Most rings are narrow and dark; the outer mu ring is faintly blue.
  const bands=[
   [1.46,1.475,260,'#c5d8dc'],
   [1.55,1.565,290,'#cbdde0'],
   [1.66,1.675,300,'#c4d9de'],
   [1.77,1.795,430,'#cee2e5'],
   [1.89,1.915,480,'#d3e6e9'],
   [2.06,2.085,520,'#d7eaec'],
   [2.34,2.385,700,'#6cbed7']
  ];
  bands.forEach(([min,max,n,color],band)=>{
   for(let i=0;i<n;i++){
    const radius=min+(max-min)*sr();
    const phi=sr()*Math.PI*2;
    this.rings.push({radius,phi,band,color,alpha:.35+sr()*.6,size:.38+sr()*.52,speed:(.00005+.00010/Math.sqrt(radius))});
   }
  });
  for(let i=0;i<120;i++)this.stars.push({x:sr(),y:sr(),r:.4+sr()*.8,a:.12+sr()*.42});
 }
 draw(ctx){
  this.clear(ctx);this.time+=1;
  const w=ctx.canvas.width,h=ctx.canvas.height,cx=w*.5+this.shiftX,cy=h*.48+this.shiftY;
  const R=Math.min(w*.149,h*.19)*this.zoom;
  ctx.save();
  // Sparse stationary background.
  for(const s of this.stars){
   ctx.globalAlpha=s.a;ctx.fillStyle='#c3d0de';
   ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  const obliquity=this.pitch, spin=this.roll;
  const rotate=(radius,t)=>{
   const a=radius*Math.cos(t), b=radius*Math.sin(t);
   // Pitch around X, then yaw around Y, then roll in screen space.
   const y=b*Math.sin(obliquity), z=b*Math.cos(obliquity);
   const x1=a*Math.cos(this.yaw)+z*Math.sin(this.yaw);
   const z1=-a*Math.sin(this.yaw)+z*Math.cos(this.yaw);
   return {x:x1*Math.cos(spin)-y*Math.sin(spin),y:x1*Math.sin(spin)+y*Math.cos(spin),z:z1};
  };
  const mapRing=(p)=>{
   const t=p.phi+this.time*p.speed;
   const q=rotate(p.radius,t);
   return {x:cx+q.x*R,y:cy+q.y*R,z:q.z};
  };
  const paintRing=(front)=>{
   for(const p of this.rings){
    const q=mapRing(p);
    if((q.z>=0)!==front)continue;
    if(!front && (q.x-cx)*(q.x-cx)+(q.y-cy)*(q.y-cy)<R*R)continue;
    ctx.globalAlpha=p.alpha*(front?.94:.52);
    ctx.fillStyle=p.color;
    ctx.beginPath();ctx.arc(q.x,q.y,p.size*Math.max(.75,R/115),0,Math.PI*2);ctx.fill();
   }
  };
  paintRing(false);
  // A smooth, softly tinted ice-giant sphere.
  ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(194,232,239,.72)';
  ctx.lineWidth=1.1;
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();
  // Restrained, thin orbital guides interwoven with the ring particles.
  const ringGuides=[1.47,1.56,1.67,1.79,1.91,2.08,2.37];
  const guide=(front)=>{
   ctx.strokeStyle='rgba(190,224,231,.16)';
   ctx.lineWidth=.55;
   for(const radius of ringGuides){
    ctx.beginPath();let drawing=false;
    for(let j=0;j<=300;j++){
     const t=j*Math.PI*2/300;
     const q=rotate(radius,t);
     const isFront=q.z>=0;
     if(isFront!==front){drawing=false;continue;}
     const X=q.x, Y=q.y;
     if(!drawing){ctx.moveTo(cx+X*R,cy+Y*R);drawing=true;}
     else ctx.lineTo(cx+X*R,cy+Y*R);
    }
    ctx.stroke();
   }
  };
  // Orbital guides remain faint enough not to overpower the point cloud.
  guide(true);
  // The near side of the rings must cross the foreground of Saturn.
  paintRing(true);
  ctx.globalAlpha=1;
  ctx.textAlign='center';ctx.fillStyle='rgba(215,210,190,.8)';
  ctx.font='12px sans-serif';ctx.fillText('URANUS  •  THIN RINGS',cx,Math.min(h-14,cy+R*1.32));
  ctx.restore();
 }
}
;stage=MainStage.go();