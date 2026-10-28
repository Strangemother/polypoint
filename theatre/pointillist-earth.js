/*
title: Pointillist Earth
categories: geometry, animation
files:
    head
    point
    pointlist
    stage
---
A rotating pointillist Earth with coastlines made of thousands of dots.
*/
const outlines=[
[[-168,72],[-135,69],[-125,53],[-117,32],[-105,25],[-97,16],[-88,15],[-83,25],[-81,31],[-69,48],[-54,59],[-80,63],[-97,73],[-125,73]],
[[-82,12],[-75,6],[-80,-5],[-75,-15],[-70,-30],[-74,-44],[-68,-55],[-59,-50],[-50,-32],[-43,-22],[-35,-8],[-50,0],[-61,8],[-74,12]],
[[-72,60],[-49,59],[-41,67],[-40,77],[-51,84],[-61,82]],
[[-11,36],[-10,43],[-3,46],[9,55],[27,60],[30,70],[52,74],[80,78],[115,75],[155,67],[179,59],[160,50],[145,46],[140,35],[126,28],[120,13],[109,3],[103,-6],[114,-8],[121,-1],[128,7],[121,27],[110,38],[94,43],[78,49],[69,29],[50,29],[43,40],[35,43],[28,40],[23,36],[12,36],[7,44],[-1,43],[-11,36]],
[[-17,37],[-4,36],[12,33],[32,30],[42,14],[51,11],[45,-6],[38,-18],[34,-28],[29,-34],[18,-35],[12,-23],[7,-5],[-5,6],[-16,20]],
[[112,-11],[115,-23],[125,-35],[139,-39],[151,-36],[153,-25],[143,-13],[130,-13],[122,-11]],
[[43,-12],[50,-14],[49,-24],[45,-26],[43,-18]],
[[130,31],[136,35],[140,36],[145,44],[142,35]],
[[-10,59],[-5,54],[-4,50],[-10,52]],
[[-24,65],[-14,64],[-16,68]],
[[95,22],[105,17],[110,4],[116,-6],[108,-8],[102,7]],
[[167,-34],[176,-40],[173,-46],[169,-44]],
[[-180,-72],[-120,-72],[-50,-74],[0,-72],[60,-74],[120,-70],[180,-72],[180,-89],[-180,-89]]
];
function inside(x,y,a){let b=false;for(let i=0,j=a.length-1;i<a.length;j=i++){const p=a[i],q=a[j];if((p[1]>y)!=(q[1]>y)&&x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0])b=!b;}return b}
let seed=8312;function rand(){seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;}
class MainStage extends Stage{
 canvas='playspace'
 mounted(){
  this.land=[];this.sea=[];this.rot=-.5;this.t=0;
  // Four deliberately distinct orbital speeds: 24 near-static,
  // 5 gentle, 1 medium, and 2 fast.
  this.satellites=Array.from({length:32},(_,i)=>({
    phase:i*2.399963,
    rate:i<24 ? .00012+(i%4)*.000035
         :i<29 ? .00065+(i%3)*.00016
         :i===29 ? .0024
         : .011+(i-30)*.0035,
    tilt:i>=30 ? Math.PI/2-.07 : -1.2+(i%9)*.29,
    node:i>=30 ? (i===30 ? .35 : 2.25) : i*1.618,
    range:1.07+(i%5)*.055, size:.65+(i%4)*.14
  }));
  for(let i=0;i<14000;i++){
   const lon=rand()*360-180,lat=Math.asin(rand()*2-1)*180/Math.PI;
   const p={lon:lon*Math.PI/180,lat:lat*Math.PI/180,s:.6+rand()*.9,phase:rand()*6.28};
   if(outlines.some(a=>inside(lon,lat,a)))this.land.push(p);else if(rand()<.16)this.sea.push(p);
  }
 }
 draw(ctx){
  this.clear(ctx);this.rot+=.0025;this.t+=.013;
  const w=ctx.canvas.width,h=ctx.canvas.height,cx=w/2,cy=h/2,r=Math.min(w,h)*.42;
  ctx.save();ctx.strokeStyle='rgba(75,201,218,.20)';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
  const paint=(arr,land)=>{for(const p of arr){
   const u=p.lon+this.rot,c=Math.cos(p.lat),x=c*Math.sin(u),z=c*Math.cos(u),y=Math.sin(p.lat);
   const yy=y*.98-z*.20,zz=y*.20+z*.98;if(zz<=0)continue;
   ctx.globalAlpha=(land?.48+.5*zz:.1+.19*zz)*(.93+.07*Math.sin(this.t+p.phase));
   ctx.fillStyle=land?(zz>.45?'#a9f5d6':'#4dc9b8'):'#4988a4';
   ctx.beginPath();ctx.arc(cx+x*r,cy-yy*r,(land?1.35:.6)*p.s*(.5+.5*zz)*Math.max(.7,r/230),0,Math.PI*2);ctx.fill();
  }};
  paint(this.sea,false);paint(this.land,true);ctx.globalAlpha=1;
  ctx.fillStyle='#a9dde0';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText('POINTILLIST EARTH',cx,Math.min(h-12,cy+r+24));
  // Abstract orbiting points, matching the Earth's pointillist style.
  for(const sat of this.satellites){
   const a=this.t*sat.rate/.013+sat.phase;
   const ca=Math.cos(a),sa=Math.sin(a);
   const ci=Math.cos(sat.tilt),si=Math.sin(sat.tilt);
   const cn=Math.cos(sat.node),sn=Math.sin(sat.node);
   const ox=sat.range*(ca*cn-sa*ci*sn);
   const oy=sat.range*(ca*sn+sa*ci*cn);
   const oz=sat.range*sa*si;
   // A point behind the globe is hidden only when projected inside its disc.
   if(oz<0 && ox*ox+oy*oy<1)continue;
   const sz=(.9+.16*Math.max(-1,oz))*sat.size*Math.max(.7,r/230);
   ctx.globalAlpha=oz<0?.48:.85;
   ctx.fillStyle='#a0a6ad';
   ctx.beginPath();
   ctx.arc(cx+ox*r,cy-oy*r,sz,0,Math.PI*2);
   ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.restore();
 }
}
;stage=MainStage.go();