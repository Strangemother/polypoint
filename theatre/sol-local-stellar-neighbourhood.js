/*
title: Sol Neighbourhood — 3D Stellar Navigation
categories: astronomy, vector, 3D, navigation
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
  this.down=e=>{this.keys[e.code]=true;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Equal','Minus'].includes(e.code))e.preventDefault()};
  this.up=e=>{this.keys[e.code]=false};
  window.addEventListener('keydown',this.down);window.addEventListener('keyup',this.up);
  // Right ascension in hours; declination degrees; heliocentric distance light-years.
  // Approximate visual positions, epoch and proper motion not corrected.
  const data=[
    ['SOL',0,0,0,'#e6be7d'],
    ['PROXIMA CENTAURI',14.495,-61.32,4.24,'#c88972'],
    ['ALPHA CENTAURI AB',14.660,-59.17,4.36,'#cfbf9f'],
    ["BARNARD'S STAR",17.9635,4.69,5.96,'#b98070'],
    ['LUHMAN 16',10.821,-52.68,6.59,'#9a766c'],
    ['WISE 0855',8.9197,-6.75,7.20,'#74778b'],
    ['WOLF 359',10.9414,7.01,7.78,'#b3756f'],
    ['LALANDE 21185',11.0556,35.97,8.29,'#bc8d7b'],
    ['SIRIUS',6.7525,-16.71,8.58,'#9fc4cb'],
    ['LUYTEN 726-8',1.6504,-16.05,8.73,'#a97b77'],
    ['ROSS 154',18.8304,-22.16,9.68,'#a67670'],
    ['ROSS 248',23.69,44.18,10.32,'#aa8178'],
    ['EPSILON ERIDANI',3.5488,-9.46,10.48,'#cab084'],
    ['LACAILLE 9352',23.10,-35.85,10.69,'#b98f85'],
    ['ROSS 128',11.7967,.80,11.01,'#b88678'],
    ['PROCYON',7.655,5.225,11.46,'#c9ccd0'],
    ['TAU CETI',1.734,-15.94,11.91,'#d2b98c']
  ];
  this.stars=data.map(([name,ra,dec,dist,color])=>{
    const a=ra*Math.PI/12,d=dec*Math.PI/180;
    return {name,dist,color,x:dist*Math.cos(d)*Math.cos(a),y:dist*Math.sin(d),z:dist*Math.cos(d)*Math.sin(a)};
  });
  let seed=17513;
  const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)|0)>>>0)/4294967296;
  this.background=Array.from({length:950},()=>({x:(rnd()*2-1)*13,y:(rnd()*2-1)*13,z:(rnd()*2-1)*13,c:['#61768d','#786b83','#728b85','#8a7771'][Math.floor(rnd()*4)]}));
  this.routeIndices=[0,2,1,3,6,8,12];
 }
 draw(ctx){
  const w=this.canvas.width,h=this.canvas.height,t=this.time++/60;
  this.yaw+=.0009;
  if(this.keys.ArrowLeft)this.yaw-=.015;
  if(this.keys.ArrowRight)this.yaw+=.015;
  if(this.keys.ArrowUp)this.pitch=Math.max(-1.15,this.pitch-.015);
  if(this.keys.ArrowDown)this.pitch=Math.min(1.15,this.pitch+.015);
  if(this.keys.Equal||this.keys.NumpadAdd)this.zoom=Math.min(18,this.zoom*1.014);
  if(this.keys.Minus||this.keys.NumpadSubtract)this.zoom=Math.max(.45,this.zoom/1.014);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.globalAlpha=1;ctx.fillStyle='#060b13';ctx.fillRect(0,0,w,h);
  const extent=Math.min(w*.35,h*.42)*this.zoom;
  const project=([x,y,z])=>{
    x/=13;y/=13;z/=13;
    const xx=x*Math.cos(this.yaw)-z*Math.sin(this.yaw);
    const zz=x*Math.sin(this.yaw)+z*Math.cos(this.yaw);
    const yy=y*Math.cos(this.pitch)-zz*Math.sin(this.pitch);
    const depth=y*Math.sin(this.pitch)+zz*Math.cos(this.pitch);
    const p=3/(3-depth*.42);
    return [w*.5+xx*extent*p,h*.52+yy*extent*p,depth];
  };
  // Grid shows the size of a 26-light-year cubic survey volume.
  const corners=[];
  for(const x of [-13,13])for(const y of [-13,13])for(const z of [-13,13])corners.push(project([x,y,z]));
  ctx.strokeStyle='#324b59';ctx.lineWidth=.8;ctx.setLineDash([3,7]);
  corners.forEach((p,i)=>corners.forEach((q,j)=>{
   if(j<=i||![1,2,4].includes(i^j))return;
   ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
  }));
  ctx.setLineDash([]);
  for(const star of this.background){
   const [x,y]=project([star.x,star.y,star.z]);
   ctx.fillStyle=star.c;ctx.globalAlpha=.38;
   ctx.fillRect(x,y,1,1);
  }
  ctx.globalAlpha=1;
  // All waypoint coordinates are derived from the RA/Dec/distance entries.
  for(let i=0;i<this.stars.length;i++){
   const star=this.stars[i],p=project([star.x,star.y,star.z]);
   ctx.fillStyle=star.color;ctx.beginPath();ctx.arc(p[0],p[1],i===0?3:2,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=star.color;ctx.lineWidth=.55;ctx.beginPath();ctx.arc(p[0],p[1],i===0?7:5,0,Math.PI*2);ctx.stroke();
   ctx.font='9px monospace';ctx.fillStyle='#9db7b9';ctx.textAlign='left';
   ctx.fillText(star.name,p[0]+8,p[1]-7);
  }
  // Local magnified Solar System: real orbital ordering and approximate
  // relative heliocentric semimajor axes, displayed with nonlinear scaling.
  // Magnification is essential: Neptune is only about 0.00047 light-years out.
  const sun=project([0,0,0]);
  const planets=[
    ['MERCURY',.387,.206,.241,'#8d999e'],
    ['VENUS',.723,.007,.615,'#c4a486'],
    ['EARTH',1,.017,1,'#76b3cb'],
    ['MARS',1.524,.093,1.881,'#bc806f'],
    ['JUPITER',5.203,.049,11.86,'#c9ac88'],
    ['SATURN',9.537,.057,29.46,'#c8b990'],
    ['URANUS',19.19,.046,84.02,'#8bb7b7'],
    ['NEPTUNE',30.07,.011,164.8,'#748dbb'],
    ['PLUTO',39.48,.249,248,'#a9a0a0']
  ];
  // The orbital circles are geometry in the shared 3D scene, not screen-space ellipses.
  // Exaggerated physical scale: outer orbit spans ~3.3 light-year plot units.
  const orbitScale=3.3/Math.sqrt(39.48);
  const orbit3D=(radius,theta,e)=>[
    radius*(Math.cos(theta)-e*.18),
    0,
    radius*Math.sin(theta)*Math.sqrt(1-e*e)
  ];
  let earthPosition=null;
  for(let i=0;i<planets.length;i++){
    const [name,au,e,period,color]=planets[i];
    const radius=Math.sqrt(au)*orbitScale;
    ctx.beginPath();
    for(let j=0;j<=128;j++){
      const p=project(orbit3D(radius,j/128*Math.PI*2,e));
      if(j===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);
    }
    ctx.strokeStyle='#34515b';ctx.lineWidth=.6;ctx.stroke();
    const angle=i*2.39996+t*.13/Math.sqrt(period);
    const pos3D=orbit3D(radius,angle,e);
    if(name==='EARTH')earthPosition={x:pos3D[0],y:pos3D[1],z:pos3D[2]};
    const p=project(pos3D);
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(p[0],p[1],i===2?2.2:i===4?2.4:1.55,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='#93b5bc';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('SOL · 3D ORBITS (MAGNIFIED)',sun[0]+15,sun[1]+76);
  const route=this.routeIndices.map(i=>i===0?earthPosition:this.stars[i]);
  const curve=[];
  for(let i=0;i<route.length-1;i++){
   const a=route[i],b=route[i+1];
   const p=[a.x,a.y,a.z],q=[b.x,b.y,b.z];
   const bend=(i%2===0?1:-1)*1.15;
   const c1=[p[0]*.65+q[0]*.35,p[1]*.65+q[1]*.35+bend,p[2]*.65+q[2]*.35];
   const c2=[p[0]*.35+q[0]*.65,p[1]*.35+q[1]*.65-bend,p[2]*.35+q[2]*.65];
   for(let j=0;j<=40;j++){
    const u=j/40,v=1-u;
    curve.push([0,1,2].map(k=>v*v*v*p[k]+3*v*v*u*c1[k]+3*v*u*u*c2[k]+u*u*u*q[k]));
   }
  }
  ctx.beginPath();curve.forEach((p,i)=>{const v=project(p);i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]);});
  ctx.strokeStyle='#648fc0';ctx.lineWidth=1;ctx.stroke();
  const marker=project(curve[Math.floor(t*12)%curve.length]);
  ctx.fillStyle='#36a9ff';ctx.beginPath();ctx.arc(marker[0],marker[1],2.5,0,Math.PI*2);ctx.fill();
  ctx.textAlign='left';ctx.font='13px monospace';ctx.fillStyle='#aec4c4';
  ctx.fillText('SOL / LOCAL STELLAR NEIGHBOURHOOD',20,27);
  ctx.font='11px monospace';ctx.fillStyle='#819ca4';
  ctx.fillText('17 NAMED SYSTEMS  /  ±13 LIGHT-YEAR VOLUME',20,48);
  ctx.fillText('NAMED STARS: APPROX. 3D POSITIONS  /  BACKGROUND: ILLUSTRATIVE',20,67);
  ctx.fillText('PLANET ORBITS ENLARGED · FICTIONAL FLIGHT PATH · ARROWS ORBIT · +/- ZOOM',20,h-20);
 }
}
stage=MainStage.go();