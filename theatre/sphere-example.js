/*
---
title: Minimal Quaternion Wavy Sphere
categories: pseudo3D
files:
    head
    point
    stage
    mouse
    dragging
---
*/
// Minimal teaching example: just quaternion rotation and projected latitude lines.
class MainStage extends Stage {
    canvas = 'playspace'
    live = true
    mounted() {
        this.sphere = this.center.copy().update({ radius: 200 })
        this.dragging.add(this.sphere)

        this.q = [1, 0, 0, 0]; // quaternion [w,x,y,z]
        this.last = null;
        // this.radius = Math.min(this.canvas.width, this.canvas.height) * 0.34;
        const canvas = this.canvas;
        // canvas.style.touchAction = 'none';
        const mouse = e => {
            const cHeight = canvas.height // this.sphere.radius * 2
            const b = canvas.getBoundingClientRect();
            let sX = this.sphere.x// canvas.width/2
            // let sY = this.sphere.y// canvas.width/2
            let sR = this.sphere.radius;
            let x = ( (e.clientX - b.left) * canvas.width / b.width - sX) / sR;
            let y = (cHeight / 2 - (e.clientY - b.top) * cHeight / b.height) / sR;
            const d = Math.hypot(x,y);
            if (d > 1) {
                x /= d;
                y /= d;
            }
            return [x,y,Math.sqrt(Math.max(0,1-x*x-y*y))];
        };

        canvas.addEventListener('pointerdown', e => {

            if (e.button !== 2){ return;}

            this.last=mouse(e);
            canvas.setPointerCapture(e.pointerId);
        });

        canvas.addEventListener('pointermove',e=>{
            if(!this.last){return};
            const a = this.last,
                b = mouse(e);
            const cross=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
            const len=Math.hypot(...cross), dot=Math.max(-1,Math.min(1,a.reduce((s,v,i)=>s+v*b[i],0)));
            if(len>1e-8) {
                const half = Math.atan2(len,dot)/2, t=Math.sin(half)/len;
                this.q = this.mul([Math.cos(half),...cross.map(v=>v*t)],this.q);
                const n = Math.hypot(...this.q);
                this.q = this.q.map(v=>v/n);
            }
            this.last = b;
        });

        const end=()=>this.last=null;
        canvas.addEventListener('pointerup',end);
        canvas.addEventListener('pointercancel',end);
        canvas.addEventListener('lostpointercapture',end);
    }

    mul(a,b) {
        const [w,x,y,z]=a,[W,X,Y,Z]=b;
        return [w*W-x*X-y*Y-z*Z,w*X+x*W+y*Z-z*Y,w*Y-x*Z+y*W+z*X,w*Z+x*Y-y*X+z*W];
    }

    rotate([x,y,z]) {
        const [w,a,b,c]=this.q;
        const u=2*(b*z-c*y),v=2*(c*x-a*z),t=2*(a*y-b*x);
        return [x+w*u+b*t-c*v,y+w*v+c*u-a*t,z+w*t+a*v-b*u];
    }

    draw(ctx) {
        this.clear(ctx)
        this.sphere.pen.circle(ctx)
        this.drawSphere(ctx)
    }

    drawSphere(ctx) {
        const cx = this.sphere.x, //ctx.canvas.width / 2,
            cy = this.sphere.y, // ctx.canvas.height / 2,
            r = this.sphere.radius;

        const project = p => {
            const [x,y,z]=this.rotate(p),scale=3.6/(3.6-z*.34);
            return [cx+x*r*scale,cy-y*r*scale,z];
        };

        // The pole axis is visible through the transparent globe.
        const a = project([0, -1.24, 0]),
            b = project([0, 1.24, 0])
            ;

        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);

        ctx.strokeStyle = 'rgba(166,222,239,.38)';
        ctx.lineWidth = 2;
        ctx.stroke();

        let lineCount = 15
        const wibblesPerLat = 50;
        const waveformAmp = .02;
        const mountainFreq = 1;
        const detailFreq = .03;
        const startSliceAngle = 0;
        const endSliceAngle = 280;
        const colors = ['#deb78b', '#ba8a68', '#edc7a2', '#b76e57', '#e7d0aa'];
        const colorCount = colors.length
        // Each latitude is a sinusoidally perturbed circle on a 3D sphere.
        for(let k=1;k<=lineCount;k++){
            const lat = -Math.PI / 2 + k * Math.PI / (lineCount+1),
                frequency = 3 + k % 5,
                mountainFrequency = 3 + k % 4,
                phase = k * 1.618;
            const line = [];

            for(let i=startSliceAngle;i<=endSliceAngle;i++){
                const lon=i*2*Math.PI/280;
                const wave = waveformAmp * (
                      mountainFreq * Math.sin(lon * mountainFrequency + Math.floor(Math.cos(lat)) - phase * .01)
                      + detailFreq * Math.sin(lon * (frequency + Math.floor(wibblesPerLat * Math.cos(lat))) - phase * .01)
                );
                const t = lat + wave;
                line.push(project([Math.cos(t)*Math.cos(lon),Math.sin(t),Math.cos(t)*Math.sin(lon)]));
            }
            // Same path, two passes: faded rear segments and bright front segments.
            for(const front of [false,true]){
                ctx.beginPath();
                let drawing=false;
                for(const p of line){
                    if((p[2]>=0)===front){
                        if(drawing)ctx.lineTo(p[0],p[1]);
                        else ctx.moveTo(p[0],p[1]);
                        drawing=true;
                    } else drawing=false;
                }
                ctx.strokeStyle=colors[k%colorCount];
                ctx.globalAlpha=front?1:.2;
                ctx.lineWidth=front?1.4:.9;
                ctx.stroke();
            }
        }

        ctx.globalAlpha=1;
    }
}

stage=MainStage.announce();
