/*
title: Hyperspace Warp Tapered Spectrum
categories: particles, space, animation
files:
    head
    stage

Individually coloured stars with rotated six-band spectral trails at warp.
A surrounding recycled star volume and a tiny blue steering indicator.
Three sliders control impulse speed, warp speed, and acceleration.
Mouse position controls turning relative to the canvas centre.
Click the canvas or press Space to engage/disengage warp.
Stars accelerate into colourful trails and settle back into points.
*/

addSliderControlSet({
    impulseSpeed: {min: 0, max: 20, step: 0.5, value: 0,
        onchange(ev, unit) { stage.impulseSpeed = Number(ev.currentTarget.value); unit.value = ev.currentTarget.value; }},
    warpSpeed: {min: 20, max: 200, step: 5, value: 95,
        onchange(ev, unit) { stage.warpSpeed = Number(ev.currentTarget.value); unit.value = ev.currentTarget.value; }},
    starCount: {min: 200, max: 5000, step: 100, value: 1100,
        onchange(ev, unit) { stage.setStarCount(Number(ev.currentTarget.value)); unit.value = ev.currentTarget.value; }},
    spectrumShift: {min: 0, max: 5, step: 1, value: 0,
        onchange(ev, unit) { stage.spectrumShift = Number(ev.currentTarget.value); unit.value = ev.currentTarget.value; }},
    warpRamp: {min: 0.2, max: 5, step: 0.1, value: 1,
        onchange(ev, unit) { stage.warpRamp = Number(ev.currentTarget.value); unit.value = ev.currentTarget.value; }}
});

class WarpStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.stars = Array.from({length: 1100}, () => this.makeStar(true));
        this.speed = 0;
        this.distanceUnits = 0;
        this.elapsedSeconds = 0;
        this.targetSpeed = 0;
        this.impulseSpeed = 0;
        this.warpSpeed = 95;
        this.warpRamp = 1;
        this.spectrumShift = 0;
        this.warpEngaged = false;
        this.lastTime = performance.now();
        this.steerX = 0;
        this.steerY = 0;
        this.keysDown = new Set();
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.steerX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
            this.steerY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.steerX = 0;
            this.steerY = 0;
        });
        this.canvas.style.cursor = 'none';
        this.canvas.addEventListener('click', () => this.toggleWarp());
        this.onWarpKey = e => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                this.keysDown.add(e.code);
                e.preventDefault();
            }
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleWarp();
            }
        };
        window.addEventListener('keydown', this.onWarpKey);
        window.addEventListener('keyup', e => this.keysDown.delete(e.code));
        window.addEventListener('blur', () => this.keysDown.clear());
    }

    setStarCount(count) {
        const target = Math.max(200, Math.min(5000, Math.round(count)));
        while (this.stars.length < target) this.stars.push(this.makeStar(true));
        if (this.stars.length > target) this.stars.length = target;
    }

    makeStar(initial = false) {
        // Stars live in camera-relative coordinates. Recycled stars are
        // introduced ahead of the flight direction instead of popping up
        // at arbitrary screen coordinates.
        const depth = initial ? 2 + Math.random() * 145 : 115 + Math.random() * 35;
        // Seed across the actual camera frustum rather than a square.
        // The 10% overscan keeps stars populated right up to the edges.
        const width = this.canvas.width;
        const height = this.canvas.height;
        const focal = Math.min(width, height) * 0.75;
        const halfX = depth * width / (2 * focal) * 1.1;
        const halfY = depth * height / (2 * focal) * 1.1;
        return {
            x: (Math.random() * 2 - 1) * halfX,
            y: (Math.random() * 2 - 1) * halfY,
            z: depth,
            colorIndex: Math.floor(Math.random() * 6),
            brightness: 0.55 + Math.random() * 0.45
        };
    }

    toggleWarp() {
        this.warpEngaged = !this.warpEngaged;
    }

    project(star, width, height, z = star.z) {
        const focal = Math.min(width, height) * 0.75;
        const scale = focal / Math.max(z, 0.2);
        return {
            x: width * 0.5 + star.x * scale,
            y: height * 0.5 + star.y * scale
        };
    }

    draw(ctx) {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Ease speed in both directions. In normal space stars are still.
        this.targetSpeed = this.warpEngaged ? this.warpSpeed : this.impulseSpeed;
        const response = 1 - Math.exp(-dt * (this.warpEngaged ? 1.8 : 2.4) * this.warpRamp);
        const previousSpeed = this.speed;
        this.speed += (this.targetSpeed - this.speed) * response;
        // Speed already describes simulated depth-units per real second.
        // Integrate the mean frame velocity for a frame-rate-independent odometer.
        this.distanceUnits += Math.max(0, (previousSpeed + this.speed) * 0.5) * dt;
        this.elapsedSeconds += dt;

        ctx.fillStyle = '#02040e';
        ctx.fillRect(0, 0, width, height);
        ctx.lineCap = 'round';

        const keyX = Number(this.keysDown.has('ArrowRight')) - Number(this.keysDown.has('ArrowLeft'));
        const keyY = Number(this.keysDown.has('ArrowDown')) - Number(this.keysDown.has('ArrowUp'));
        const inputX = Math.max(-1, Math.min(1, this.steerX + keyX));
        const inputY = Math.max(-1, Math.min(1, this.steerY + keyY));
        const turnRate = 0.75 / (1 + this.speed / 90);
        const yaw = inputX * dt * turnRate;
        const pitch = inputY * dt * turnRate;
        const cy = Math.cos(yaw), sy = Math.sin(yaw);
        const cp = Math.cos(pitch), sp = Math.sin(pitch);

        for (let i = 0; i < this.stars.length; i++) {
            let star = this.stars[i];
            // Rotate the local starfield opposite to the camera heading.
            const x = star.x * cy - star.z * sy;
            const z = star.x * sy + star.z * cy;
            const y = star.y * cp - z * sp;
            star.z = star.y * sp + z * cp - this.speed * dt;
            star.x = x;
            star.y = y;

            // Keep a bounded local star volume, recycling anything behind
            // the viewer or well outside the surrounding simulation area.
            if (star.z <= 0.8 || star.z > 175 ||
                Math.abs(star.x) > 180 || Math.abs(star.y) > 180) {
                star = this.stars[i] = this.makeStar();
            }

            const p = this.project(star, width, height);
            // Offscreen stars remain in the 3D volume and can drift
            // into the view as the camera turns.
            if (p.x < -100 || p.x > width + 100 ||
                p.y < -100 || p.y > height + 100) continue;

            // Draw previous projection as the trail tail.
            // The extra distance produces the iconic warp stretch.
            const trailDistance = this.speed * 0.12;
            const tail = this.project(star, width, height, star.z + trailDistance);
            const warpAmount = Math.min(this.speed / Math.max(this.warpSpeed, 1), 1);
            // Six sequential spectral bands along a single projected trail.
            // At low speed there is only a white star; increasing speed
            // separates the wavelengths into visible streaks.
            const dx = p.x - tail.x;
            const dy = p.y - tail.y;
            const spectrum = ['#fa526b', '#ffb457', '#f9eb82', '#64efbf', '#3876dc', '#a88cff'];
            // Every star traverses the entire rainbow; blue takes more space.
            const weights = [1, 1, 1, 0.7, 2.3, 1];
            // Rotate colours and their widths as pairs, preserving blue's emphasis.
            const shift = ((Math.round(this.spectrumShift) + star.colorIndex) % spectrum.length + spectrum.length) % spectrum.length;
            const shiftedColors = spectrum.map((_, i) => spectrum[(i + shift) % spectrum.length]);
            const shiftedWeights = weights.map((_, i) => weights[(i + shift) % weights.length]);
            const totalWeight = shiftedWeights.reduce((sum, weight) => sum + weight, 0);
            const separation = Math.min(1, Math.max(0, (this.speed - 8) / 50));
            const baseWidth = Math.max(0.8, Math.min(3.2, 0.7 + (1 - star.z / 130) * 2.3));
            if (separation > 0.01) {
                for (let band = 0; band < spectrum.length; band++) {
                    let weightBefore = 0;
                    for (let k = 0; k < band; k++) weightBefore += shiftedWeights[k];
                    const a = weightBefore / totalWeight;
                    const b = (weightBefore + shiftedWeights[band]) / totalWeight;
                    const start = 1 - b * separation;
                    const end = 1 - a * separation;
                    // Keep normal width except for the fine red leading segment.
                    ctx.lineWidth = (band + shift) % spectrum.length === 0 ? baseWidth * 0.3 : baseWidth;
                    ctx.globalAlpha = star.brightness;
                    ctx.strokeStyle = shiftedColors[band];
                    ctx.beginPath();
                    ctx.moveTo(tail.x + dx * start, tail.y + dy * start);
                    ctx.lineTo(tail.x + dx * end, tail.y + dy * end);
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
            }

            // Resting stars use a softer tint in the same colour family;
            // their warp heads match the leading band of the rotated spectrum.
            const restingColors = ['#ffc5d0', '#ffdeb1', '#fff0b6', '#bcebdc', '#bdd5ff', '#dfc7ff'];
            ctx.fillStyle = separation > 0.01
                ? shiftedColors[0]
                : restingColors[shift];
            ctx.globalAlpha = star.brightness;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.6, baseWidth * 0.6), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#c4d5ee';
        ctx.fillText(this.warpEngaged ? 'WARP ENGAGED' : (Math.abs(this.speed - this.impulseSpeed) > 1 ? 'DROPPING OUT OF WARP' : 'IMPULSE / IDLE'), 22, 32);
        ctx.fillStyle = '#7891b1';
        ctx.font = '12px sans-serif';
        ctx.fillText('Mouse / arrow keys to steer · click or SPACE for warp', 22, 53);
        ctx.fillStyle = '#b6ddf8';
        ctx.font = '13px monospace';
        ctx.fillText('DIST  ' + this.distanceUnits.toFixed(1) + ' su', 22, 75);
        ctx.fillText('TIME  ' + this.elapsedSeconds.toFixed(1) + ' s', 22, 94);
        // Replace the big cursor with a subtle blue indicator.
        const mx = width * (0.5 + this.steerX * 0.5);
        const my = height * (0.5 + this.steerY * 0.5);
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#67c7ff';
        ctx.fill();
    }
}

;stage = WarpStage.go();
