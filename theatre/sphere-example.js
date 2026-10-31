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
// Minimal teaching example: drag to move the sphere, right-drag to rotate it.
// The trackball chooses the 3D axis; mouse distance keeps rotation continuous beyond the rim.
class MainStage extends Stage {
    canvas = 'playspace'
    live = true
    gridDirection = 'both' // 'latitude', 'longitude', or 'both'
    latitudeCount = 6
    longitudeCount = 1 // Each circle contains two opposite meridians.

    mounted() {
        this.sphere = this.center.copy().update({ radius: 200, color: 'rgb(166,222,239)' })
        this.dragging.add(this.sphere)

        this.q = [1, 0, 0, 0]; // quaternion [w,x,y,z]
        this.last = null;
        this.poleMarkers = [
            { y: -1, color: '#990000' },
            { y: 1, color: '#009900' },
            // { y: 0, color: this.sphere.color },
        ];

        const canvas = this.canvas;
        const mouse = e => {
            const b = canvas.getBoundingClientRect();
            return [
                (e.clientX - b.left) * canvas.width / b.width,
                -(e.clientY - b.top) * canvas.height / b.height
            ];
        };
        const trackball = ([mouseX, mouseY]) => {
            const { x, y, radius } = this.sphere;
            const px = (mouseX-x)/radius, py = (mouseY+y)/radius;
            const d = Math.hypot(px,py);
            const z = d <= Math.SQRT1_2 ? Math.sqrt(1-d*d) : 0.5/d;
            return [px,py,z];
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
            const dx = b[0]-a[0], dy = b[1]-a[1];
            const distance = Math.hypot(dx,dy);
            if(distance>0) {
                const from = trackball(a), to = trackball(b);
                const axis = [
                    from[1]*to[2]-from[2]*to[1],
                    from[2]*to[0]-from[0]*to[2],
                    from[0]*to[1]-from[1]*to[0]
                ];
                const half = distance / this.sphere.radius / 2, t=Math.sin(half)/Math.hypot(...axis);
                this.q = this.mul([Math.cos(half),...axis.map(v=>v*t)],this.q);
                const n = Math.hypot(...this.q);
                this.q = this.q.map(v=>v/n);
                this.sphere.dirty = true;
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
        this.drawSphere(ctx)
        // this.sphere.pen.circle(ctx)
    }

    drawSphere(ctx) {
        const cx = this.sphere.x, //ctx.canvas.width / 2,
            cy = this.sphere.y, // ctx.canvas.height / 2,
            r = this.sphere.radius - 1;

        const project = p => {
            const [x,y,z]=this.rotate(p),scale=3.6/(3.6-z*.34);
            return [cx+x*r*scale,cy-y*r*scale,z];
        };

        const bright = 'rgba(166,222,239,.38)';
        const dim = 'rgba(166,222,239,.076)';
        const strokePoleLine = (from, to, color, width) => {
            ctx.beginPath();
            ctx.moveTo(from[0], from[1]);
            ctx.lineTo(to[0], to[1]);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        };

        const poles = [-1, 1].map(y => project([0, y, 0]));
        // inside line
        // ctx.save();
        ctx.setLineDash([6, 4]);
        strokePoleLine(this.sphere, poles[1], 'rgb(166,222,239)', 1);
        // ctx.restore();
        ctx.setLineDash([]);

        for (const [i, sign] of [-1, 1].entries()) {
            const tip = project([0, sign * 1.04, 0]);
            const pole = poles[i];
            const tipDistance = Math.hypot(tip[0] - cx, tip[1] - cy);
            if (pole[2] < 0 && tipDistance > r) {
                // Both projected endpoints lie on the same ray from the sphere center.
                const edge = [
                    cx + (tip[0] - cx) * r / tipDistance,
                    cy + (tip[1] - cy) * r / tipDistance
                ];
                strokePoleLine(tip, edge, bright, 2);
                strokePoleLine(edge, pole, dim, 2);
            } else {
                strokePoleLine(tip, pole, pole[2] >= 0 ? bright : dim, 2);
            }
        }

        const latitudeMode = 'bezier'; // Use 'wave' to keep the sampled latitude renderer.
        const waveformAmp = 0;
        const startSliceAngle = 0;
        const endSliceAngle = 280;
        const colors = [this.sphere.color] // ['#deb78b', '#ba8a68', '#edc7a2', '#b76e57', '#e7d0aa'];

        const { gridDirection, latitudeCount, longitudeCount } = this;
        if (!['latitude', 'longitude', 'both'].includes(gridDirection)) {
            throw new RangeError(`Unknown grid direction: ${gridDirection}`);
        }
        for (const [name, count] of [['latitudeCount', latitudeCount], ['longitudeCount', longitudeCount]]) {
            if (!Number.isSafeInteger(count) || count < 0) {
                throw new RangeError(`${name} must be a non-negative integer`);
            }
        }
        const state = [this.sphere, cx, cy, r, ...this.q, gridDirection, latitudeCount, longitudeCount,
            latitudeMode, waveformAmp, startSliceAngle, endSliceAngle];
        if (!this.gridCache || state.some((value, i) => value !== this.gridCache.state[i])) {
            this.sphere.dirty = true;
        }
        if (this.sphere.wasDirty) {
            this.gridCache = null;
            const paths = [];
            const useWave = latitudeMode === 'wave' || waveformAmp !== 0 || startSliceAngle !== 0 || endSliceAngle !== 280;
            const createGrid = (direction, lineCount) => {
                if (useWave) {
                    const options = { lineCount, waveformAmp, startSliceAngle, endSliceAngle };
                    return direction === 'latitude'
                        ? this.createWaveLatitudes(project, options)
                        : this.createWaveLongitudes(project, options);
                }
                const options = { cx, cy, r, lineCount };
                return direction === 'latitude'
                    ? this.createBezierLatitudes(options)
                    : this.createBezierLongitudes(options);
            };
            if (gridDirection !== 'longitude') paths.push(...createGrid('latitude', latitudeCount));
            if (gridDirection !== 'latitude') paths.push(...createGrid('longitude', longitudeCount));
            if (gridDirection === 'both') paths.sort((a, b) => Number(a.front) - Number(b.front));
            this.gridCache = { state, paths };
        }
        for (const { path, front, index } of this.gridCache.paths) {
            ctx.strokeStyle = colors[index % colors.length];
            ctx.globalAlpha = front ? 1 : 1;
            ctx.lineWidth = front ? 1 : .9;
            ctx.stroke(path);
        }

        ctx.globalAlpha=1;

        // ctx.save();
        const poleMarkers = this.poleMarkers.map(({ y, color }) => ({ position: project([0, y, 0]), color }))
            .sort((a, b) => a.position[2] - b.position[2]);
        for (const { position, color } of poleMarkers) {
            ctx.fillStyle = color;
            ctx.globalAlpha = position[2] >= 0 ? .9 : .18;
            ctx.beginPath();
            ctx.arc(position[0], position[1], r * .1 * .2, 0, Math.PI * 2);
            ctx.fill();
        }
        // ctx.restore();
    }

    createWaveLatitudes(project, options) {
        return this.createWaveGrid(project, options, 'latitude');
    }

    createWaveLongitudes(project, options) {
        return this.createWaveGrid(project, options, 'longitude');
    }

    createWaveGrid(project, { lineCount, waveformAmp, startSliceAngle, endSliceAngle }, direction) {
        const paths = [];
        const wibblesPerLat = 50;
        const mountainFreq = 1;
        const detailFreq = .03;
        for(let k=1;k<=lineCount;k++){
            const lat = direction === 'latitude' ? -Math.PI / 2 + k * Math.PI / (lineCount+1) : 0,
                meridian = (k - 1) * Math.PI / lineCount,
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
                const x = Math.cos(t) * Math.cos(lon);
                const y = Math.sin(t);
                const z = Math.cos(t) * Math.sin(lon);
                line.push(project(direction === 'latitude'
                    ? [x, y, z]
                    : [x * Math.cos(meridian) - y * Math.sin(meridian),
                        z, x * Math.sin(meridian) + y * Math.cos(meridian)]));
            }
            // Same path, two passes: faded rear segments and bright front segments.
            for(const front of [false,true]){
                const path = new Path2D();
                let drawing=false;
                for(const p of line){
                    if((p[2]>=0)===front){
                        if(drawing)path.lineTo(p[0],p[1]);
                        else path.moveTo(p[0],p[1]);
                        drawing=true;
                    } else drawing=false;
                }
                paths.push({ path, front, index: k });
            }
        }
        return paths;
    }

    createBezierLatitudes(options) {
        return this.createBezierGrid(options, 'latitude');
    }

    createBezierLongitudes(options) {
        return this.createBezierGrid(options, 'longitude');
    }

    createBezierGrid({ cx, cy, r, lineCount }, direction) {
        const paths = [];
        const fullTurn = Math.PI * 2;
        for (let k = 1; k <= lineCount; k++) {
            const lat = -Math.PI / 2 + k * Math.PI / (lineCount + 1);
            const meridian = (k - 1) * Math.PI / lineCount;
            const u = this.rotate(direction === 'latitude'
                ? [Math.cos(lat), 0, 0] : [Math.cos(meridian), 0, Math.sin(meridian)]);
            const v = this.rotate(direction === 'latitude'
                ? [0, 0, Math.cos(lat)] : [0, 1, 0]);
            const center = this.rotate(direction === 'latitude'
                ? [0, Math.sin(lat), 0] : [0, 0, 0]);
            const depthAmplitude = Math.hypot(u[2], v[2]);

            const pointAt = angle => {
                const c = Math.cos(angle), s = Math.sin(angle);
                const x = center[0] + u[0] * c + v[0] * s;
                const y = center[1] + u[1] * c + v[1] * s;
                const z = center[2] + u[2] * c + v[2] * s;
                const dx = -u[0] * s + v[0] * c;
                const dy = -u[1] * s + v[1] * c;
                const dz = -u[2] * s + v[2] * c;
                const denominator = 3.6 - z * .34;
                const scale = 3.6 / denominator;
                return {
                    x: cx + r * x * scale,
                    y: cy - r * y * scale,
                    z,
                    dx: r * scale * (dx + x * .34 * dz / denominator),
                    dy: -r * scale * (dy + y * .34 * dz / denominator)
                };
            };

            let spans;
            if (depthAmplitude > 0 && Math.abs(center[2]) < depthAmplitude) {
                const phase = Math.atan2(v[2], u[2]);
                const offset = Math.acos(-center[2] / depthAmplitude);
                const start = phase - offset, crossing = phase + offset;
                const firstCount = Math.max(1, Math.min(3, Math.round(4 * (crossing - start) / fullTurn)));
                spans = [
                    { start, end: crossing, count: firstCount, front: true },
                    { start: crossing, end: start + fullTurn, count: 4 - firstCount, front: false }
                ];
            } else {
                spans = [{ start: 0, end: fullTurn, count: 4, front: center[2] >= 0 }];
            }

            // Split at depth crossings so each cubic has one front/back style.
            for (const front of [false, true]) {
                for (const span of spans) {
                    if (span.front !== front) continue;
                    const path = new Path2D();
                    let start = pointAt(span.start);
                    path.moveTo(start.x, start.y);
                    const step = (span.end - span.start) / span.count;
                    for (let i = 1; i <= span.count; i++) {
                        const mid = pointAt(span.start + step * (i - .5));
                        const end = pointAt(span.start + step * i);
                        const determinant = start.dx * end.dy - start.dy * end.dx;
                        const tangentScale = Math.hypot(start.dx, start.dy) * Math.hypot(end.dx, end.dy);
                        let firstHandle = 4 / 3 * Math.tan(step / 4);
                        let secondHandle = firstHandle;
                        // Match the projected midpoint as well as both endpoint tangents.
                        if (Math.abs(determinant) > tangentScale * 1e-10) {
                            const mx = 8 / 3 * (mid.x - (start.x + end.x) / 2);
                            const my = 8 / 3 * (mid.y - (start.y + end.y) / 2);
                            firstHandle = (mx * end.dy - my * end.dx) / determinant;
                            secondHandle = (mx * start.dy - my * start.dx) / determinant;
                        }
                        path.bezierCurveTo(
                            start.x + firstHandle * start.dx, start.y + firstHandle * start.dy,
                            end.x - secondHandle * end.dx, end.y - secondHandle * end.dy,
                            end.x, end.y
                        );
                        start = end;
                    }
                    paths.push({ path, front, index: k });
                }
            }
        }
        return paths;
    }
}

stage=MainStage.announce();
