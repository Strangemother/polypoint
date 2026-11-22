/*
title: VOL - Living Desktop / Iris Prototype
categories: ui
    experimental
files:
    head
    point
    stage
    mouse
    dragging
---
VOL visual frontend v1.1. Rounder blob centre, no radial spokes.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.t = 0;
        this.windows=[{id:1,x:240,y:160,title:'A living desktop',parentId:null}];
        this.nextWindowId=2;
        this.activeWindow=null;
        this.camera={x:0,y:0};this.zoom=1;
        this.irisWorld=null;
        this.mode=null;
        this.lastTap={time:0,x:0,y:0};
        const el=document.getElementById('playspace');
        el.style.touchAction='none';
        el.addEventListener('wheel',e=>{
            e.preventDefault();
            const p=loc(e),old=this.zoom;
            const next=Math.max(.25,Math.min(3,old*Math.exp(-e.deltaY*.0015)));
            const k=next/old;
            this.camera.x=p.x-(p.x-this.camera.x)*k;
            this.camera.y=p.y-(p.y-this.camera.y)*k;
            this.zoom=next;
        },{passive:false});
        const loc=e=>{const b=el.getBoundingClientRect();return {x:(e.clientX-b.left)*el.width/b.width,y:(e.clientY-b.top)*el.height/b.height}};
        el.addEventListener('pointerdown',e=>{
            const p=loc(e),pw=Math.min(370,Math.max(185,el.width*.45))*this.zoom,ph=170*this.zoom;
            const hit=[...this.windows].reverse().find(win=>{
                const x=win.x*this.zoom+this.camera.x,y=win.y*this.zoom+this.camera.y;
                return p.x>=x&&p.x<=x+pw&&p.y>=y&&p.y<=y+ph;
            });
            this.mode=hit?'panel':'pan';
            this.activeWindow=hit||null;
            this.pointer=e.pointerId;
            this.previous=p;
            this.travel=0;
            el.setPointerCapture(e.pointerId);
        });
        el.addEventListener('pointermove',e=>{
            if(this.mode===null||this.pointer!==e.pointerId)return;
            const p=loc(e),dx=p.x-this.previous.x,dy=p.y-this.previous.y;
            this.travel+=Math.hypot(dx,dy);
            if(this.mode==='panel'&&this.activeWindow){
                this.activeWindow.x+=dx/this.zoom;this.activeWindow.y+=dy/this.zoom;
            }else if(this.mode==='pan'){
                this.camera.x+=dx;this.camera.y+=dy;
            }
            this.previous=p;
        });
        el.addEventListener('pointerup',e=>{
            if(this.pointer!==e.pointerId)return;
            const p=loc(e),now=performance.now();
            if(this.travel<12){
                const old=this.lastTap;
                if(now-old.time<360&&Math.hypot(p.x-old.x,p.y-old.y)<32){
                    if(this.mode==='panel'&&this.activeWindow){
                        const parent=this.activeWindow;
                        this.spawnWindow(parent.x+65,parent.y+205,parent.id);
                    }else if(this.mode==='pan'){
                        this.spawnWindow((p.x-this.camera.x)/this.zoom,(p.y-this.camera.y)/this.zoom,null);
                    }
                    this.lastTap={time:0,x:0,y:0};
                }else{this.lastTap={time:now,x:p.x,y:p.y};}
            }
            this.mode=null;this.activeWindow=null;
        });
        el.addEventListener('pointercancel',e=>{
            if(this.pointer===e.pointerId){this.mode=null;this.activeWindow=null;}
        });
    }
    spawnWindow(x,y,parentId=null){
        const id=this.nextWindowId++;
        this.windows.push({id,x,y,parentId,title:'Workspace '+String(id).padStart(2,'0')});
        return id;
    }
    rounded(ctx,x,y,w,h,r) {
        r=Math.min(r,w/2,h/2);
        ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);
        ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);
        ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
    }
    draw(ctx) {
        this.clear(ctx);
        const w=ctx.canvas.width,h=ctx.canvas.height;
        this.t+=0.012;
        const unit=Math.min(w,h);
        const initialX=w-Math.max(64,unit*.13), initialY=h-Math.max(62,unit*.13);
        if(!this.irisWorld)this.irisWorld={x:(initialX-this.camera.x)/this.zoom,y:(initialY-this.camera.y)/this.zoom};
        const margin=Math.max(48,Math.min(72,unit*.13));
        const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
        const ix=clamp(this.irisWorld.x*this.zoom+this.camera.x,margin,w-margin);
        const iy=clamp(this.irisWorld.y*this.zoom+this.camera.y,margin,h-margin);
        const rootScale=Math.sqrt(this.zoom);
        const ir=Math.max(18,Math.min(30,unit*.052))*rootScale;
        const pw=Math.min(370,Math.max(185,w*.45));
        const ph=170;
        // Desktop atmosphere: transparent, world-relative grid.
        ctx.save();
        ctx.strokeStyle='rgba(100,162,185,.055)';ctx.lineWidth=1;
        const spacing=36*this.zoom;
        for(let x=((this.camera.x%spacing)+spacing)%spacing;x<w;x+=spacing){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
        for(let y=((this.camera.y%spacing)+spacing)%spacing;y<h;y+=spacing){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
        // Each connector resolves the closest facing corners, independent of movement parenting.
        const rect=win=>({x:win.x*this.zoom+this.camera.x,y:win.y*this.zoom+this.camera.y,
                          w:pw*this.zoom,h:ph*this.zoom});
        const cornerToward=(r,target)=>{
            const cx=r.x+r.w/2,cy=r.y+r.h/2;
            return {x:target.x<cx?r.x:r.x+r.w,y:target.y<cy?r.y:r.y+r.h};
        };
        for(const win of this.windows){
            const child=rect(win);
            const parent=win.parentId==null?null:this.windows.find(p=>p.id===win.parentId);
            const source=parent?rect(parent):null;
            const fromCenter=source?{x:source.x+source.w/2,y:source.y+source.h/2}:{x:ix,y:iy};
            const toCenter={x:child.x+child.w/2,y:child.y+child.h/2};
            const a=source?cornerToward(source,toCenter):fromCenter;
            const b=cornerToward(child,fromCenter);
            const dx=b.x-a.x,dy=b.y-a.y;
            const cp1X=a.x+dx*.42,cp1Y=a.y;
            const cp2X=b.x-dx*.42,cp2Y=b.y;
            ctx.beginPath();ctx.moveTo(a.x,a.y);
            ctx.bezierCurveTo(cp1X,cp1Y,cp2X,cp2Y,b.x,b.y);
            ctx.strokeStyle='rgba(116,197,188,.6)';ctx.lineWidth=1.3;ctx.stroke();
            const tt=(this.t*.19+win.id*.21)%1,inv=1-tt;
            const sx=inv*inv*inv*a.x+3*inv*inv*tt*cp1X+3*inv*tt*tt*cp2X+tt*tt*tt*b.x;
            const sy=inv*inv*inv*a.y+3*inv*inv*tt*cp1Y+3*inv*tt*tt*cp2Y+tt*tt*tt*b.y;
            ctx.fillStyle='#b2ffdf';
            ctx.beginPath();ctx.arc(sx,sy,2.3,0,Math.PI*2);ctx.fill();
            const px=child.x,py=child.y;
            // Transparent panel without a drop shadow.
            ctx.save();ctx.translate(px,py);ctx.scale(this.zoom,this.zoom);
            this.rounded(ctx,0,0,pw,ph,12);
            ctx.fillStyle='rgba(14,25,35,.46)';ctx.fill();
            ctx.strokeStyle='rgba(131,186,195,.35)';ctx.lineWidth=1;ctx.stroke();
            ctx.beginPath();ctx.moveTo(0+20,0+40);ctx.lineTo(0+pw-20,0+40);
            ctx.strokeStyle='rgba(115,166,178,.22)';ctx.stroke();
            ctx.font='11px monospace';ctx.fillStyle='#7ca5ae';
            ctx.fillText('V O L   /   SYSTEM',0+20,0+26);
            ctx.fillStyle='#a2c0c5';ctx.textAlign='right';
            ctx.fillText(String(win.id).padStart(2,'0')+' : ACTIVE',0+pw-20,0+26);ctx.textAlign='left';
            ctx.fillStyle='#e1f0ec';ctx.font='19px sans-serif';ctx.fillText(win.title,0+20,0+72);
            ctx.font='12px monospace';ctx.fillStyle='#8aabb1';
            ctx.fillText(win.parentId==null?'ROOT  >  DISPLAY  >  PANEL':('PARENT '+String(win.parentId).padStart(2,'0')+'  >  PANEL'),0+20,0+100);
            ctx.fillText('graph / geometry / events',0+20,0+120);
            ctx.fillStyle='#79c9a8';ctx.beginPath();ctx.arc(0+22,0+147,3.3,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#9bb7b7';ctx.fillText('SERVICE ONLINE',0+33,0+151);
            const mark=cornerToward({x:0,y:0,w:pw,h:ph},fromCenter.x<child.x?{x:-1,y:fromCenter.y-child.y}:{x:fromCenter.x-child.x,y:fromCenter.y-child.y});
            ctx.fillStyle='#9ab4bb';ctx.beginPath();ctx.arc((b.x-px)/this.zoom,(b.y-py)/this.zoom,3,0,Math.PI*2);ctx.fill();
            ctx.restore();
        }
        // Root iris, breathing, concentric arcs and rotating petals.
        const breath=1+Math.sin(this.t*2)*.055;
        ctx.save();ctx.translate(ix,iy);
        ctx.strokeStyle='rgba(103,220,166,.18)';ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(0,0,ir*1.67,0,Math.PI*2);ctx.stroke();
        ctx.setLineDash([3,7]);ctx.beginPath();ctx.arc(0,0,ir*1.36,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
        for(let n=0;n<9;n++){
            const a=n*Math.PI*2/9+this.t*.12, ra=ir*.75*breath,rb=ir*1.05*breath;
            ctx.beginPath();ctx.arc(0,0,rb,a,a+.46);
            ctx.strokeStyle=n%3===0?'#b5bb64':'#53b6a0';ctx.lineWidth=5;ctx.lineCap='round';ctx.stroke();

        }
        // Soft organic centre inspired by Polypoint's blob-example.
        // A smooth ring of gently oscillating radial points, filled with one solid colour.
        const blobPoints = 24;
        const blobRadius = ir * .49 * breath;
        const blob = [];
        for (let j = 0; j < blobPoints; j++) {
            const angle = j * Math.PI * 2 / blobPoints;
            const ripple = 1 + .025 * Math.sin(angle * 3 + this.t * 1.6)
                             + .012 * Math.sin(angle * 5 - this.t * 1.05);
            blob.push({x:Math.cos(angle)*blobRadius*ripple,
                       y:Math.sin(angle)*blobRadius*ripple});
        }
        ctx.beginPath();
        let last = blob[blobPoints - 1], first = blob[0];
        ctx.moveTo((last.x + first.x)/2, (last.y + first.y)/2);
        for (let j = 0; j < blobPoints; j++) {
            const p = blob[j], next = blob[(j+1)%blobPoints];
            ctx.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2);
        }
        ctx.closePath();
        ctx.fillStyle = '#4caa91';
        ctx.fill();
        ctx.restore();
        for(let j=0;j<3;j++){
            ctx.beginPath();ctx.arc(ix,iy-ir*2.0-j*15*rootScale,2.9*rootScale,0,Math.PI*2);
            ctx.fillStyle=j===0?'#72d5a0':j===1?'#c5b660':'#697984';ctx.fill();
        }
        ctx.font='10px monospace';ctx.textAlign='right';ctx.fillStyle='rgba(174,200,202,.65)';
        ctx.fillText('VOL  /  ROOT',ix+ir*1.55,iy-ir*1.9);
        ctx.textAlign='left';ctx.fillStyle='rgba(141,175,178,.6)';
        ctx.font='10px monospace';ctx.fillText('DRAG THE GLASS PANEL  •  DOUBLE-TAP SPACE: ROOT / DOUBLE-TAP PANEL: CHILD / VOL V1.1',18,h-20);
        ctx.restore();
    }
}
stage = MainStage.go();
