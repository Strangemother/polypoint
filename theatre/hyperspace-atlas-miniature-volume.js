/*
title: Hyperspace Atlas — Miniature Galactic Volume
categories: space, starfield, 3D, bezier, navigation
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
 mounted(){
  this.time=0;this.yaw=-.32;this.pitch=.21;this.zoom=1;this.keys={};
  const rnd=(()=>{let v=284729;return()=>((v=Math.imul(v,1664525)+1013904223|0)>>>0)/4294967296})();
  this.stars=[];
  const centres=[[-.53,-.19,-.22],[.27,.22,-.35],[.46,-.25,.44],[-.18,.37,.3]];
  for(let i=0;i<2100;i++){
   const clustered=i<1540, c=centres[i%centres.length];
   const randn=()=> (rnd()+rnd()+rnd()+rnd()-2)*.24;
   const x=clustered?c[0]+randn():rnd()*1.9-.95;
   const y=clustered?c[1]+randn():rnd()*1.5-.75;
   const z=clustered?c[2]+randn():rnd()*1.7-.85;
   this.stars.push({x,y,z,light:.65+rnd()*.35,r: 1.05+rnd()*.85,tint:rnd(),cluster:clustered?i%centres.length:-1});
  }
  this.stops=[[-.77,.22,-.46],[-.55,-.18,-.18],[-.29,.12,.24],[.03,.32,-.38],[.32,-.12,.12],[.67,.17,.49]];
  this.keysDown=e=>{this.keys[e.code]=true;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Equal','Minus'].includes(e.code))e.preventDefault()};
  this.keysUp=e=>{this.keys[e.code]=false};
  window.addEventListener('keydown',this.keysDown);window.addEventListener('keyup',this.keysUp);
 }
 draw(ctx){
  const w=this.canvas.width,h=this.canvas.height,t=this.time++/60;
  // Gentle continuous orbit, additive to any manually adjusted camera angle.
  this.yaw+=.0009;
  if(this.keys.ArrowLeft)this.yaw-=.015;
  if(this.keys.ArrowRight)this.yaw+=.015;
  if(this.keys.ArrowUp)this.pitch=Math.max(-1,this.pitch-.015);
  if(this.keys.ArrowDown)this.pitch=Math.min(1,this.pitch+.015);
  if(this.keys.Equal||this.keys.NumpadAdd)this.zoom=Math.min(2.5,this.zoom*1.015);
  if(this.keys.Minus||this.keys.NumpadSubtract)this.zoom=Math.max(.5,this.zoom/1.015);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.globalAlpha=1;ctx.shadowBlur=0;
  ctx.fillStyle='#060b13';ctx.fillRect(0,0,w,h);
  const extent=Math.min(w*.37,h*.43)*this.zoom;
  const project=([x,y,z])=>{
    const xx=x*Math.cos(this.yaw)-z*Math.sin(this.yaw);
    const zz=x*Math.sin(this.yaw)+z*Math.cos(this.yaw);
    const yy=y*Math.cos(this.pitch)-zz*Math.sin(this.pitch);
    const depth=y*Math.sin(this.pitch)+zz*Math.cos(this.pitch);
    const k=3/(3-depth*.4);
    return [w*.5+xx*extent*k,h*.52+yy*extent*k,depth];
  };
  // Draw a strong, unmistakable frame in screen coordinates.
  const corners=[];
  for(const x of [-1,1])for(const y of [-.85,.85])for(const z of [-1,1])corners.push(project([x,y,z]));
  ctx.strokeStyle='#4d8190';ctx.lineWidth=1;ctx.setLineDash([5,7]);
  corners.forEach((p,i)=>corners.forEach((q,j)=>{
    if(j<=i||![1,2,4].includes(i^j))return;
    ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
  }));
  ctx.setLineDash([]);
  const stars=this.stars||[];
  const centres=[[-.53,-.19,-.22],[.27,.22,-.35],[.46,-.25,.44],[-.18,.37,.3]];
  const coreStars=centres.map((c,i)=>stars.filter(st=>st.cluster===i).reduce((best,st)=>!best||Math.hypot(st.x-c[0],st.y-c[1],st.z-c[2])<Math.hypot(best.x-c[0],best.y-c[1],best.z-c[2])?st:best,null));
  for(const st of stars){
    const [x,y]=project([st.x,st.y,st.z]);
    if(!Number.isFinite(x+y))continue;
    const palette=['#627eaa','#8b6b9c','#688f8a','#a1816c','#758899','#986f7b','#748a6e','#7786af'];
    const distance=st.cluster<0?10:Math.hypot(st.x-centres[st.cluster][0],st.y-centres[st.cluster][1],st.z-centres[st.cluster][2]);
    const hot=st.cluster>=0 && coreStars[st.cluster]===st;
    const nearby=distance<.16;
    ctx.fillStyle=hot?'#f3a557':nearby?'#b8b8ad':palette[Math.min(palette.length-1,Math.floor(st.tint*palette.length))];
    ctx.globalAlpha=hot?1:nearby?.9:.72;
    ctx.beginPath();ctx.arc(x,y,Math.max(.455,st.r*(hot?1.9:nearby?1.05:.78)*.7),0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  const points=[];
  for(let i=0;i<this.stops.length-1;i++){
    const a=this.stops[i],b=this.stops[i+1];
    const c1=[a[0]+(b[0]-a[0])*.33,a[1]-.24,a[2]+.18];
    const c2=[a[0]+(b[0]-a[0])*.66,b[1]+.24,b[2]-.18];
    for(let j=0;j<=45;j++){
      const u=j/45,v=1-u;
      points.push([0,1,2].map(k=>v*v*v*a[k]+3*v*v*u*c1[k]+3*v*u*u*c2[k]+u*u*u*b[k]));
    }
  }
  ctx.strokeStyle='#648fc0';ctx.lineWidth=1;ctx.beginPath();
  points.forEach((p,i)=>{const v=project(p);if(i===0)ctx.moveTo(v[0],v[1]);else ctx.lineTo(v[0],v[1]);});
  ctx.stroke();
  for(let i=0;i<this.stops.length;i++){
    const [x,y]=project(this.stops[i]);
    ctx.fillStyle='#82aee0';ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();
    ctx.font='11px monospace';ctx.fillText(String(i+1).padStart(2,'0'),x+9,y-6);
  }
  const [shipX,shipY]=project(points[Math.floor(t*12)%points.length]);
  ctx.fillStyle='#36a9ff';ctx.beginPath();ctx.arc(shipX,shipY,2.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c4e8e0';ctx.font='14px monospace';ctx.textAlign='left';
  ctx.fillText('HYPERSPACE ATLAS / 3D ROUTE',20,28);
  ctx.font='11px monospace';ctx.fillStyle='#9bbabf';
  ctx.fillText(stars.length+' STARS · '+this.stops.length+' WAYPOINTS',20,48);
  ctx.fillText('SCHEMATIC DISPLAY · ARROWS ORBIT · +/- ZOOM',20,67);
  ctx.fillText('VIEWPORT: '+w+' x '+h,20,h-17);
 }
}
stage=MainStage.go();