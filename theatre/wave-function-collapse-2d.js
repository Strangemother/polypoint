/*
title: Wave Function Collapse 100 Points
files:
    head
    point
    stage
    ../point_src/stage.js
    dragging
    pointlist
    mouse
*/
const tiles=[[0,0,0,0],[1,0,1,0],[0,1,0,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[1,1,1,0],[0,1,1,1],[1,0,1,1],[1,1,0,1],[1,1,1,1]];
const dirs=[[0,-1,0,2],[1,0,1,3],[0,1,2,0],[-1,0,3,1]];
class MainStage extends Stage {
canvas='playspace';
mounted(){this.reset();this.canvas.addEventListener('click',()=>this.reset());window.addEventListener('keydown',e=>{if(e.code==='Space'){this.pause=!this.pause;e.preventDefault();}});}
reset(){this.grid=Array.from({length:100},()=>tiles.map((_,i)=>i));this.count=0;this.done=false;this.pause=false;this.last=0;this.propagate();}
propagate(){
let change=true;
while(change){change=false;
for(let i=0;i<100;i++){
 const x=i%10,y=(i/10)|0;
 for(const [dx,dy,edge,opposite] of dirs){
 const xx=x+dx,yy=y+dy,adj=xx>=0&&xx<10&&yy>=0&&yy<10?this.grid[yy*10+xx]:null;
 const keep=this.grid[i].filter(t=>adj?adj.some(u=>tiles[t][edge]===tiles[u][opposite]):tiles[t][edge]===0);
 if(keep.length!==this.grid[i].length){this.grid[i]=keep;change=true;}
 if(!keep.length){this.reset();return;}
 }
}
}
}
collapse(){
const open=this.grid.map((a,i)=>({a,i})).filter(z=>z.a.length>1);
if(!open.length){this.done=true;return;}
const m=Math.min(...open.map(z=>z.a.length)),pool=open.filter(z=>z.a.length===m);
const z=pool[Math.floor(Math.random()*pool.length)];
this.grid[z.i]=[z.a[Math.floor(Math.random()*z.a.length)]];this.count++;this.propagate();
}
draw(ctx){
const w=this.canvas.width,h=this.canvas.height;
ctx.fillStyle='#101824';ctx.fillRect(0,0,w,h);
if(!this.pause&&!this.done&&performance.now()-this.last>125){this.collapse();this.last=performance.now();}
const side=Math.min(w*.88,h-120),cell=side/10,left=(w-side)/2,top=(h-side)/2+20;
ctx.textAlign='center';ctx.fillStyle='#f0f8ff';ctx.font='bold 21px sans-serif';ctx.fillText('WAVE FUNCTION COLLAPSE',w/2,33);
ctx.font='14px sans-serif';ctx.fillStyle='#a5b8ce';
ctx.fillText(this.grid.filter(a=>a.length===1).length+'/100 resolved · '+this.count+' choices · '+(this.done?'Complete':this.pause?'Paused':'Collapsing'),w/2,57);
ctx.fillText('Click to regenerate · Space to pause',w/2,h-18);
for(let i=0;i<100;i++){
const a=this.grid[i],x=left+(i%10)*cell,y=top+((i/10)|0)*cell,cx=x+cell/2,cy=y+cell/2;
ctx.fillStyle=a.length===1?'#18353c':'#1d2b3b';ctx.fillRect(x+1,y+1,cell-2,cell-2);
ctx.strokeStyle='#41546a';ctx.strokeRect(x+.5,y+.5,cell-1,cell-1);
if(a.length!==1){ctx.fillStyle='#a2bad1';ctx.font=Math.max(10,cell*.25)+'px sans-serif';ctx.fillText(a.length,cx,cy+cell*.09);continue;}
ctx.strokeStyle='#6de2cb';ctx.lineWidth=Math.max(3,cell*.14);ctx.lineCap='round';
for(let d=0;d<4;d++)if(tiles[a[0]][d]){const v=dirs[d];ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+v[0]*cell*.48,cy+v[1]*cell*.48);ctx.stroke();}
if(tiles[a[0]].some(Boolean)){ctx.beginPath();ctx.fillStyle='#e7fff4';ctx.arc(cx,cy,Math.max(2,cell*.065),0,Math.PI*2);ctx.fill();}
}
}
}
const stage = MainStage.go();