/*
title: Galactic Guide — Wireframe Spaceship
categories: geometry, animation, retro
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
*/
class MainStage extends Stage {
 canvas='playspace';
 mounted(){this.tick=0;this.px=0;this.py=0;this.keys={};window.addEventListener('keydown',e=>{this.keys[e.code]=true;if(e.code.startsWith('Arrow'))e.preventDefault()});window.addEventListener('keyup',e=>{this.keys[e.code]=false});}
 draw(ctx){
  const w=this.canvas.width,h=this.canvas.height,t=this.tick++/60;
  ctx.fillStyle='#030a10';ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(Math.min(w/920,h/670),Math.min(w/920,h/670));
  const cyan='#59f5df',green='#befb7f';
  ctx.font='14px monospace';ctx.fillStyle=cyan;ctx.textAlign='left';
  ctx.fillText('GALACTIC FIELD GUIDE  //  VESSEL REGISTRY',-420,-292);
  ctx.fillStyle='#72999b';ctx.fillText('OBJECT 002: IMPROBABILITY CRUISER',-420,-265);
  ctx.textAlign='right';ctx.fillText('SCAN  :  ONLINE',420,-292);
  const A=[],E=[];
  function v(x,y,z){A.push([x,y,z]);return A.length-1;}
  function edge(a,b){E.push([a,b]);}
  // Long diamond fuselage and four parallel stabiliser struts.
  const nose=v(0,0,245),tail=v(0,0,-230);
  const mid=[];
  for(let i=0;i<8;i++){const q=i*Math.PI/4;mid.push(v(Math.cos(q)*78,Math.sin(q)*62,20));}
  for(let i=0;i<8;i++){edge(nose,mid[i]);edge(mid[i],tail);edge(mid[i],mid[(i+1)%8]);}
  for(const side of [-1,1]){
   const wingTip=v(side*240,-5,-90),wingFront=v(side*104,0,95),wingBack=v(side*100,0,-120);
   edge(wingTip,wingFront);edge(wingTip,wingBack);edge(wingFront,wingBack);
   const pod1=v(side*180,0,-145),pod2=v(side*180,0,25);
   edge(pod1,pod2);edge(wingTip,pod1);edge(wingTip,pod2);
  }
  const dx=(this.keys.ArrowRight?1:0)-(this.keys.ArrowLeft?1:0),dy=(this.keys.ArrowDown?1:0)-(this.keys.ArrowUp?1:0);this.px=Math.max(-160,Math.min(160,this.px+dx*3.1));this.py=Math.max(-90,Math.min(90,this.py+dy*2.5));
  const spin=t*.29+(this.px/160)*.22, pitch=.2+Math.sin(t*.3)*.18-(this.py/90)*.16;
  const proj=(p)=>{
   let [x,y,z]=p;
   let xx=x*Math.cos(spin)+z*Math.sin(spin),zz=-x*Math.sin(spin)+z*Math.cos(spin);
   let yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=y*Math.sin(pitch)+zz*Math.cos(pitch);
   let k=580/(580-depth*.36);
   return [xx*k+this.px,yy*k+this.py,depth];
  }
  const P=A.map(proj);
  for(let i=0;i<E.length;i++){
   const [a,b]=E[i],p=P[a],q=P[b];
   ctx.strokeStyle=(p[2]+q[2]>0)?cyan:'#20585d';ctx.lineWidth=(p[2]+q[2]>0)?1.9:1;
   ctx.shadowColor=cyan;ctx.shadowBlur=(p[2]+q[2]>0)?7:0;
   ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
  }
  ctx.shadowBlur=0;
  // Navigation beacons and lively coloured component callouts.
  for(const [index,color,label,ox,oy] of [[0,'#ff526d','NOSE SENSOR',95,-70],[1,'#5aaaff','DRIVE ARRAY',-160,90],[10,'#ff526d','PORT FIN',-120,-75],[13,'#5aaaff','STARBOARD FIN',120,95]]){
    const p=P[Math.min(index,P.length-1)],blink=.38+.62*(.5+.5*Math.sin(t*(index%2?7:5)+index));
    ctx.fillStyle=color;ctx.globalAlpha=blink;ctx.beginPath();ctx.arc(p[0],p[1],4.4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    const lx=Math.max(-405,Math.min(320,p[0]+ox)),ly=Math.max(-210,Math.min(190,p[1]+oy));
    ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(lx,ly);ctx.lineTo(lx+26,ly);ctx.stroke();
    ctx.font='12px monospace';ctx.fillStyle=color;ctx.textAlign='left';ctx.fillText(label,lx+30,ly+4);
  }
  ctx.strokeStyle='#38636b';ctx.lineWidth=1;ctx.setLineDash([4,7]);
  ctx.beginPath();ctx.ellipse(0,0,295,90,-.2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=green;ctx.font='14px monospace';ctx.textAlign='left';
  ctx.fillText('ARROW KEYS : FLY THE VESSEL',-420,224);
  ctx.fillText('PROPULSION : HIGHLY IMPROBABLE',-420,246);
  ctx.fillText('ROTATION   : '+(spin%(2*Math.PI)).toFixed(2)+' RAD',-420,270);
  ctx.textAlign='right';ctx.fillStyle='#72999b';ctx.fillText('PLEASE DO NOT PANIC',420,270);
  ctx.restore();
 }
}
stage=MainStage.go();