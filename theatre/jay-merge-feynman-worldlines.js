/*
title: J Merge - Chromatic Worldlines
categories: lines
    animation
files:
    head
    ../point_src/stage.js
---
Blue Jay and Red Jay meet, share a purple timeline, then part with fading colour echoes.
*/
class MainStage extends Stage {
 canvas = 'playspace'
 mounted(){this.start=performance.now();}
 draw(ctx){
 const w=this.canvas.width,h=this.canvas.height,t=(performance.now()-(this.start||performance.now()))/1000;
 ctx.fillStyle='#090d1a';ctx.fillRect(0,0,w,h);
 const L=w*.1,R=w*.9,A=w*.36,B=w*.64,Y=h*.52,D=Math.min(110,h*.19);
 const s=a=>{a=Math.max(0,Math.min(1,a));return a*a*(3-2*a)};
 const y=(x,sign)=>Y+sign*D*(1-s((x-L)/(A-L))+s((x-B)/(R-B)))+Math.sin(x*.025-t*1.5+sign)*5;
 for(let side=0;side<2;side++){
   const sign=side?1:-1, own=side?[255,75,105]:[65,155,255], other=side?[65,155,255]:[255,75,105];
   const color=x=>{const mix=.5*s((x-L)/(A-L))*(1-s((x-B)/(R-B)))+(x>B?.32*Math.exp(-(x-B)/(w*.13)):0);
     return own.map((v,k)=>Math.round(v*(1-mix)+other[k]*mix)).join(',')};
   for(const glow of [true,false]){
     ctx.lineWidth=glow?10:3;ctx.lineCap='round';
     for(let x=L;x<R-3;x+=3){ctx.strokeStyle='rgba('+color(x)+','+(glow?.12:1)+')';ctx.beginPath();ctx.moveTo(x,y(x,sign));ctx.lineTo(x+3,y(x+3,sign));ctx.stroke();}
   }
   const px=L+(R-L)*((t*.085)%1),py=y(px,sign);
   ctx.fillStyle='rgb('+color(px)+')';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=16;
   ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 }
 ctx.textAlign='center';ctx.font='13px sans-serif';ctx.fillStyle='#94a2c2';
 [['BLUE + RED',L],['MERGE',A],['PURPLE',w*.5],['SPLIT',B],['FADE',R]].forEach(([label,x])=>ctx.fillText(label,x,h*.18));
 ctx.textAlign='left';ctx.font='17px sans-serif';ctx.fillStyle='#dae4ff';ctx.fillText('J MERGE   ·   chromatic worldlines',L,h*.10);
 ctx.font='12px sans-serif';ctx.fillStyle='#8391ac';ctx.fillText('Time →',R-45,h*.85);ctx.fillText('Residual colour fades after separation',L,h*.85);
 }
}
stage=MainStage.go();