/*
title: Hyperspace Warp Controls
categories: particles, space, animation
files:
    head
    stage

Three sliders control impulse speed, warp speed, and acceleration.
Click the canvas or press Space to engage/disengage warp.
Stars accelerate into colourful trails and settle back into points.
*/

addSliderControlSet({
    impulseSpeed: {min: 0, max: 20, step: 0.5, value: 0,
        onchange(ev, unit) { stage.impulseSpeed = Number(ev.currentTarget.value); unit.value = ev.currentTarget.value; }},
    warpSpeed: {min: 20, max: 200, step: 5, value: 95,
        onchange(ev, unit) { stage.warpSpeed = Number(ev.currentTarget.value); unit.value = ev.currentTarget.value; }},
    warpRamp: {min: 0.2, max: 5, step: 0.1, value: 1,
        onchange(ev, unit) { stage.warpRamp = Number(ev.currentTarget.value); unit.value = ev.currentTarget.value; }}
});

class WarpStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.stars = Array.from({length: 650}, () => this.makeStar());
        this.speed = 0;
        this.targetSpeed = 0;
        this.impulseSpeed = 0;
        this.warpSpeed = 95;
        this.warpRamp = 1;
        this.warpEngaged = false;
        this.lastTime = performance.now();
        this.canvas.style.cursor = 'pointer';
        this.canvas.addEventListener('click', () => this.toggleWarp());
        this.onWarpKey = e => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleWarp();
            }
        };
        window.addEventListener('keydown', this.onWarpKey);
    }

    makeStar() {
        return {
            x: (Math.random() * 2 - 1) * 65,
            y: (Math.random() * 2 - 1) * 65,
            z: 2 + Math.random() * 120,
            hue: [190, 210, 245, 280, 325, 40][Math.floor(Math.random() * 6)],
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
        this.speed += (this.targetSpeed - this.speed) * response;

        ctx.fillStyle = '#02040e';
        ctx.fillRect(0, 0, width, height);
        ctx.lineCap = 'round';

        for (let i = 0; i < this.stars.length; i++) {
            let star = this.stars[i];
            const oldZ = star.z;
            star.z -= this.speed * dt;

            // Recycle stars that pass the camera or fly outside the view.
            if (star.z <= 0.8) {
                star = this.stars[i] = this.makeStar();
                star.z = 115 + Math.random() * 15;
            }

            const p = this.project(star, width, height);
            if (p.x < -100 || p.x > width + 100 ||
                p.y < -100 || p.y > height + 100) {
                this.stars[i] = this.makeStar();
                this.stars[i].z = 115 + Math.random() * 15;
                continue;
            }

            // Draw previous projection as the trail tail.
            // The extra distance produces the iconic warp stretch.
            const trailDistance = this.speed * 0.12;
            const tail = this.project(star, width, height, star.z + trailDistance);
            const warpAmount = Math.min(this.speed / Math.max(this.warpSpeed, 1), 1);
            const light = 70 + star.brightness * 25;
            ctx.strokeStyle = `hsla(${star.hue}, 95%, ${light}%, ${0.35 + star.brightness * 0.6})`;
            ctx.lineWidth = Math.max(0.8, Math.min(3.2, 0.7 + (1 - star.z / 130) * 2.3));
            ctx.beginPath();
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();

            // At rest, points remain visible with no artificial streak.
            if (warpAmount < 0.35) {
                ctx.fillStyle = `rgba(235,242,255,${star.brightness * (1 - warpAmount)})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(0.6, ctx.lineWidth * 0.6), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#c4d5ee';
        ctx.fillText(this.warpEngaged ? 'WARP ENGAGED' : (Math.abs(this.speed - this.impulseSpeed) > 1 ? 'DROPPING OUT OF WARP' : 'IMPULSE / IDLE'), 22, 32);
        ctx.fillStyle = '#7891b1';
        ctx.font = '12px sans-serif';
        ctx.fillText('Click or press SPACE to toggle warp', 22, 53);
    }
}

;stage = WarpStage.go();
