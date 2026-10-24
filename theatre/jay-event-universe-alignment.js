/*
title: J Event - Universe Alignment
categories: 3d
    animation
files:
    head
    ../point_src/stage.js
---
Two independently spinning 3D universes bring only their event origins into coincidence. A J event flashes violet when their points meet.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() { this.start = performance.now(); }
    draw(ctx) {
        const w=this.canvas.width, h=this.canvas.height;
        const t=(performance.now()-(this.start||performance.now()))*.001;
        ctx.fillStyle='#090d19';ctx.fillRect(0,0,w,h);
        const cx=w*.5, cy=h*.52, size=Math.min(w*.17,h*.25,135);
        // Animate a full convergence, brief overlap, then separation every 10s.
        const phase=(t%12)/12;
        const smooth=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
        const approach=smooth((phase-.12)/.25);
        const retreat=smooth((phase-.58)/.27);
        const align=Math.max(0,Math.min(1,approach-retreat));
        const distance=(Math.min(w*.28,size*1.75))*(1-align);
        const flash=smooth((phase-.32)/.08)*(1-smooth((phase-.53)/.09));
        const vertices=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
        const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
        const transform=(v,side)=>{
            let [x,y,z]=v;
            const a=t*(side ? -.78 : .61)+(side ? 1.3 : .2), b=t*(side ? .57 : -.44)+(side ? -.8 : .5);
            let X=x*Math.cos(a)-z*Math.sin(a), Z=x*Math.sin(a)+z*Math.cos(a);
            let Y=y*Math.cos(b)-Z*Math.sin(b); Z=y*Math.sin(b)+Z*Math.cos(b);
            const perspective=3.8/(3.8+Z);
            return [X*size*.55*perspective,Y*size*.55*perspective];
        };
        for(let side=0;side<2;side++){
            const px=cx+(side?distance:-distance), py=cy;
            const base=side?[255,91,121]:[66,161,255];
            const mix=flash*.7;
            const rgb=base.map((v,i)=>Math.round(v*(1-mix)+[180,105,255][i]*mix));
            const points=vertices.map(v=>transform(v,side));
            ctx.lineWidth=1.6;ctx.lineJoin='round';
            ctx.strokeStyle='rgba('+rgb.join(',')+',.85)';
            ctx.shadowBlur=13;ctx.shadowColor='rgba('+rgb.join(',')+',.7)';
            edges.forEach(([i,j])=>{ctx.beginPath();ctx.moveTo(px+points[i][0],py+points[i][1]);ctx.lineTo(px+points[j][0],py+points[j][1]);ctx.stroke();});
            ctx.shadowBlur=0;
            // A local event-origin point lives in each universe.
            ctx.fillStyle='rgb('+rgb.join(',')+')';
            ctx.shadowBlur=15;ctx.shadowColor=ctx.fillStyle;
            ctx.beginPath();ctx.arc(px,py,6+flash*3,0,Math.PI*2);ctx.fill();
            ctx.shadowBlur=0;
        }
        if(flash>0){
            const radius=10+(1-flash)*size*.7;
            const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
            grad.addColorStop(0,'rgba(206,136,255,'+(.42*flash)+')');
            grad.addColorStop(1,'rgba(206,136,255,0)');
            ctx.fillStyle=grad;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#deb8ff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';
            ctx.fillText('J EVENT',cx,cy-size*1.07);
        }
        ctx.textAlign='left';ctx.fillStyle='#e2e9ff';ctx.font='16px sans-serif';
        ctx.fillText('J EVENT  /  universe alignment',Math.max(18,w*.06),Math.max(32,h*.10));
        ctx.font='12px sans-serif';ctx.fillStyle='#90a0bd';
        ctx.fillText('Blue universe',Math.max(18,w*.06),h*.89);
        ctx.textAlign='right';ctx.fillText('Red universe',w-Math.max(18,w*.06),h*.89);
        ctx.textAlign='center';ctx.fillStyle=flash>.2?'#d7acff':'#8592ad';
        ctx.fillText(flash>.2?'ORIGINS COINCIDE  •  MERGE':align>.9?'EVENT POINTS CONVERGING':'SPINNING  •  APPROACHING  •  SEPARATING',cx,h*.95);
    }
}
stage = MainStage.go();