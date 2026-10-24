/*
title: Unicode Icon Explosion
category: demo
files:
    head
    ../point_src/stage.js
---

Hundreds of animated Unicode glyphs: stars, hearts, music notes, chess pieces, arrows, weather, shapes and more. Click to blast them outward.
*/
class MainStage extends Stage {
  canvas='playspace'
  mounted(){
    this.t=0;
    this.icons=Array.from('★☆✦✧✩✪✫✬✭✮✯✰♥♡❤❥❣♪♫♬♩☀☁☂☃☄☾☽☼⚡☘☯☮☢☣⚙⚒⚓⚑⚐✈✉✂✎✏✒✔✖✚✜✿❀❁❃❋❄❅❆❇❈❉❊♠♣♦♤♧♢♟♞♜♛♚♙♘♖♕♔☕⌘⌂⌑⌁⌇⌬⌖⌗⌕⎈⏎⏵⏸⏹⏺◉◎●○◌◍◐◑◒◓◔◕◖◗◆◇◈◊■□▢▣▲△▼▽▶▷◀◁↑↓←→↗↘↙↖↔↕⇧⇩∞≈≠±÷×∑∏√∫∂∇∆∴∵∩∪⊕⊗⊙⊛⊞⊟⌛⌚☎☏✆⚑⚐⚔⚖⚗⚘⚜⚝☸☻☺☹☼☽☾♨✺✹✸✷✶✵✴✳✲✱✰');
    this.items=[];
    this.canvas.addEventListener('pointerdown',e=>{
      const r=this.canvas.getBoundingClientRect(),x=(e.clientX-r.left)*this.canvas.width/r.width,y=(e.clientY-r.top)*this.canvas.height/r.height;
      for(const p of this.items){
        const dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy)||1;
        const force=3+18*Math.exp(-d/230);
        p.vx+=dx/d*force;p.vy+=dy/d*force;
      }
    });
    this.populate();
  }
  populate(){
    const w=this.canvas.width,h=this.canvas.height;
    this.items=Array.from({length:260},(_,i)=>({
      ch:this.icons[i%this.icons.length],x:Math.random()*w,y:Math.random()*h,
      vx:(Math.random()-.5)*2.8,vy:(Math.random()-.5)*2.8,
      size:14+Math.random()*32,phase:Math.random()*6.28,
      hue:Math.random()*360,spin:(Math.random()-.5)*.035,angle:0
    }));
  }
  draw(ctx){
    const w=this.canvas.width,h=this.canvas.height;
    ctx.clearRect(0,0,w,h);
    this.t+=.025;
    if(!this.items)return;
    for(const p of this.items){
      p.x+=p.vx;p.y+=p.vy;p.angle+=p.spin;
      p.vx*=.998;p.vy*=.998;
      if(p.x<-30){p.x=w+30;}else if(p.x>w+30){p.x=-30;}
      if(p.y<-30){p.y=h+30;}else if(p.y>h+30){p.y=-30;}
      ctx.save();
      ctx.translate(p.x,p.y+Math.sin(this.t*2+p.phase)*3);
      ctx.rotate(p.angle);
      ctx.font='bold '+Math.round(p.size)+'px "DejaVu Sans","Segoe UI Symbol",sans-serif';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle='hsl('+p.hue+',75%,72%)';
      ctx.globalAlpha=.75+.25*Math.sin(this.t*2+p.phase);
      ctx.fillText(p.ch,0,0);
      ctx.restore();
    }
  }
}
stage=MainStage.go();