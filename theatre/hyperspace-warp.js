/*
title: Hyperspace Warp
categories: particles, space, animation
files:
    head
    stage

Click the canvas or press Space to engage/disengage warp.
Stars accelerate into colourful trails and settle back into points.
*/

class WarpStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.stars = Array.from({length: 650}, () => this.makeStar());
        this.speed = 0;
        this.targetSpeed = 0;
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
        this.targetSpeed = this.targetSpeed ? 0 : 95;
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
        const response = 1 - Math.exp(-dt * (this.targetSpeed ? 1.8 : 2.4));
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
            const warpAmount = Math.min(this.speed / 95, 1);
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
        ctx.fillText(this.targetSpeed ? 'WARP ENGAGED' : (this.speed > 1 ? 'DROPPING OUT OF WARP' : 'IMPULSE / IDLE'), 22, 32);
        ctx.fillStyle = '#7891b1';
        ctx.font = '12px sans-serif';
        ctx.fillText('Click or press SPACE to toggle warp', 22, 53);
    }
}

;stage = WarpStage.go();
