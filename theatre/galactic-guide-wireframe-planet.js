/*
title: Galactic Guide — Wireframe Planet
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
 mounted(){this.tick=0;}
 draw(ctx){
  const w=this.canvas.width,h=this.canvas.height,t=this.tick++/60;
  ctx.fillStyle='#050b10';ctx.fillRect(0,0,w,h);
  const scale=Math.min(w/900,h/650);
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(scale,scale);
  ctx.font='13px monospace';ctx.fillStyle='#66efcd';ctx.textAlign='left';
  ctx.fillText('THE GALACTIC FIELD GUIDE',-410,-275);
  ctx.fillStyle='#779fa5';ctx.fillText('OBJECT 001  //  PLANETARY BODY',-410,-250);
  ctx.textAlign='right';ctx.fillText('SCAN ACTIVE',410,-275);
  const radius=205;
  const yaw=t*.27,tilt=-.35;
  const project=(lat,lon)=>{
   const x=radius*Math.cos(lat)*Math.cos(lon),y=radius*Math.sin(lat),z=radius*Math.cos(lat)*Math.sin(lon);
   const X=x*Math.cos(yaw)+z*Math.sin(yaw);
   const Z=-x*Math.sin(yaw)+z*Math.cos(yaw);
   return [X,y*Math.cos(tilt)-Z*Math.sin(tilt),y*Math.sin(tilt)+Z*Math.cos(tilt)];
  };
  function strokeCurve(points,front){
   ctx.beginPath();let started=false;
   for(let i=0;i<points.length;i++){
    const p=points[i],visible=(p[2]>=0)===front;
    if(!visible){started=false;continue;}
    if(!started)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);
    started=true;
   }
   ctx.stroke();
  }
  for(let front of [false,true]){
   ctx.lineWidth=front?1.5:.7;
   ctx.strokeStyle=front?'#4fffd9':'#145b5f';
   ctx.shadowColor=front?'#36e7dd':'transparent';ctx.shadowBlur=front?8:0;
   for(let lat=-75;lat<=75;lat+=15){
    const p=[];for(let i=0;i<=360;i+=2)p.push(project(lat*Math.PI/180,i*Math.PI/180));
    strokeCurve(p,front);
   }
   for(let lon=0;lon<360;lon+=15){
    const p=[];for(let i=-90;i<=90;i+=2)p.push(project(i*Math.PI/180,lon*Math.PI/180));
    strokeCurve(p,front);
   }
  }
  ctx.shadowBlur=0;
  ctx.strokeStyle='#c4f679';ctx.lineWidth=1;
  ctx.setLineDash([4,7]);ctx.beginPath();ctx.ellipse(0,0,260,70,-.18,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#d0e78e';ctx.font='15px monospace';ctx.textAlign='left';
  ctx.fillText('ROTATION : '+(yaw%(Math.PI*2)).toFixed(2)+' RAD',-410,246);
  ctx.fillText('STATUS   : MOSTLY HARMLESS',-410,269);
  ctx.textAlign='right';ctx.fillStyle='#668f96';ctx.fillText('VECTOR DISPLAY // 1981',410,269);
  ctx.restore();
 }
}
stage=MainStage.go();