/*

The _rope_ provides constraints through vertlet chain solutions.

*/

class RopeReactor {

    gravity = 0.35;

    constructor(pins={}, dynamicPins=[]) {
        this.pinnedPositions = pins
        this.dynamicPins = dynamicPins
    }

    getPinIndicies(points) {
        const pinnedPositions = this.getPins(points)
        const pinnedIndices = Object.keys(pinnedPositions).map(Number);
        return pinnedIndices
    }

    applyPhysics(points, gravity=this.gravity, pinnedIndices) {
        if(pinnedIndices == undefined) {
            pinnedIndices = this.getPinIndicies(points)
        }

        points.forEach((p, index) => {
            if(pinnedIndices.includes(index)) { return }

            const vx = (p.x - p.oldX) * 0.98;
            const vy = (p.y - p.oldY) * 0.98;

            p.oldX = p.x;
            p.oldY = p.y;

            p.x += vx;
            p.y += vy + gravity;
        });
    }

    applyPhysics2(points, gravity2D, pinnedIndices){
        const pinnedPositions = this.getPins(points)
        if(pinnedIndices == undefined) {
            pinnedIndices = Object.keys(pinnedPositions).map(Number);
        }
        points.forEach((p, index) => {
            if (!pinnedIndices.includes(index) && (p.invMass ?? 1) !== 0) {
                p.x += gravity2D.x * (p.invMass ?? 1) * this.gravity;
                p.y += gravity2D.y * (p.invMass ?? 1) * this.gravity;
            }
        });
    }

    solveConstraints1(points, segmentLength, iterations = 5) {
        for (let j = 0; j < iterations; j++) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const difference = segmentLength - distance;
                const percent = difference / distance / 2;

                const offsetX = dx * percent;
                const offsetY = dy * percent;

                if (i !== 0) {
                    p1.x -= offsetX;
                    p1.y -= offsetY;
                }
                p2.x += offsetX;
                p2.y += offsetY;
            }
        }
    }

    solveConstraints2(points, segmentLength, iterations = 5) {
        const pl = points.last()
        let endPin = this.endPin
        const pinnedPositions = {
            0: this.mouse.point
            // , [~~(points.length *.5)]: this.midPin
            // , [points.length - 1]: endPin
        };

        const pinnedIndices = Object.keys(pinnedPositions)

        for (let j = 0; j < iterations; j++) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const difference = segmentLength - distance;
                const percent = difference / distance / 2;

                const offsetX = dx * percent;
                const offsetY = dy * percent;

                if (!pinnedIndices.includes(i)) {
                    p1.x -= offsetX;
                    p1.y -= offsetY;
                }

                if (!pinnedIndices.includes(i + 1)) {
                    p2.x += offsetX;
                    p2.y += offsetY;
                }
            }

            // Reinforce pinned positions after constraint adjustment
            pinnedIndices.forEach(index => {
                points[index].x = pinnedPositions[index].x;
                points[index].y = pinnedPositions[index].y;
            });
        }
    }

    pin(index, point) {
        /* pin an internal index item, to the XY given.
        */
       if(point == undefined) {
            // generate a point, essentially _pinning_ the current location.
            this.dynamicPins.push(index)
       }
       this.pinnedPositions[index] = point;
    }

    getPins(points) {
        let pins = Object.assign({}, this.pinnedPositions)
        this.dynamicPins.forEach((v,i)=>{
            if(pins[v] == undefined) {
                pins[v] = points[i]
            }
        })

        return pins
    }

    solveConstraints3(points, segmentLength, iterations = 5) {
        const pinnedPositions = this.getPins(points)
        const pinnedIndices = Object.keys(pinnedPositions).map(Number);
        for (let j = 0; j < iterations; j++) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001; // prevent NaN
                const difference = segmentLength - distance;

                const invMass1 = p1.invMass ?? 1; // Default to 1 if undefined
                const invMass2 = p2.invMass ?? 1;
                const totalInvMass = invMass1 + invMass2 || 0.0001; // prevent division by zero

                const percent1 = (invMass1 / totalInvMass) * difference / distance;
                const percent2 = (invMass2 / totalInvMass) * difference / distance;

                if (!pinnedIndices.includes(i)) {
                    p1.x -= dx * percent1;
                    p1.y -= dy * percent1;
                }

                if (!pinnedIndices.includes(i + 1)) {
                    p2.x += dx * percent2;
                    p2.y += dy * percent2;
                }
            }

            // Re-pin positions
            pinnedIndices.forEach(index => {
                points[index].x = pinnedPositions[index].x;
                points[index].y = pinnedPositions[index].y;
            });
        }
    }
}