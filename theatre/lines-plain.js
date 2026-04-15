/*
---
title: Locked Coupling Points
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/pointlist.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/coupling.js
---

Some lines 

 */
class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.rows = 10
        this.cols = 10
        this.cellSize = 40
        this.offset = 20

        /* These are the open passages (edges from the export). */
        this.edges = [
            [0,1],[1,11],[2,12],[3,13],[4,3],[5,4],[6,16],[7,8],[8,9],[9,19],
            [10,20],[11,21],[12,11],[13,23],[14,13],[15,14],[16,15],[17,16],
            [18,17],[19,18],[20,30],[21,22],[22,23],[23,33],[24,34],[25,24],
            [26,27],[27,37],[28,18],[29,28],[30,31],[31,32],[32,22],[33,34],
            [34,24],[35,36],[36,37],[37,38],[38,28],[39,29],[40,30],[41,31],
            [42,52],[43,53],[44,43],[45,46],[46,36],[47,37],[48,47],[49,48],
            [50,40],[51,50],[52,53],[53,63],[54,53],[55,54],[56,57],[57,67],
            [58,48],[59,49],[60,70],[61,62],[62,63],[63,73],[64,65],[65,66],
            [66,76],[67,68],[68,58],[69,68],[70,80],[71,61],[72,82],[73,74],
            [74,75],[75,65],[76,77],[77,78],[78,68],[79,78],[80,81],[81,71],
            [82,81],[83,82],[84,94],[85,75],[86,76],[87,86],[88,78],[89,88],
            [90,80],[91,92],[92,82],[93,83],[94,93],[95,94],[96,86],[97,87],
            [98,88],[99,89]
        ]

        /* Compute walls: all adjacent pairs NOT in edges. */
        this.walls = this.computeWalls()
    }

    computeWalls() {
        let rows = this.rows
            , cols = this.cols
            ;
        /* Build a set of open passages as "lo-hi" strings for fast lookup. */
        let open = new Set()
        this.edges.forEach(([a, b]) => {
            let lo = Math.min(a, b), hi = Math.max(a, b)
            open.add(lo + '-' + hi)
        })

        let walls = []
        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                let index = r * cols + c
                /* Right neighbour */
                if(c + 1 < cols) {
                    let pair = index + '-' + (index + 1)
                    if(!open.has(pair)) { walls.push([index, index + 1]) }
                }
                /* Down neighbour */
                if(r + 1 < rows) {
                    let pair = index + '-' + (index + cols)
                    if(!open.has(pair)) { walls.push([index, index + cols]) }
                }
            }
        }
        return walls
    }

    draw(ctx){
        this.clear(ctx)
        this.drawWalls(ctx)
        this.drawBorder(ctx)
    }

    drawWalls(ctx) {
        let cols = this.cols
            , size = this.cellSize
            , off = this.offset
            ;

        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.lineCap = 'square'
        ctx.beginPath()

        this.walls.forEach(([a, b]) => {
            let diff = b - a
            let row = Math.floor(a / cols)
            let col = a % cols

            if(diff === 1) {
                /* Horizontal neighbours: wall is a vertical line
                on the right edge of cell a. */
                let x = off + (col + 1) * size
                let y = off + row * size
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + size)
            } else {
                /* Vertical neighbours: wall is a horizontal line
                on the bottom edge of cell a. */
                let x = off + col * size
                let y = off + (row + 1) * size
                ctx.moveTo(x, y)
                ctx.lineTo(x + size, y)
            }
        })

        ctx.stroke()
    }

    drawBorder(ctx) {
        let size = this.cellSize
            , off = this.offset
            , w = this.cols * size
            , h = this.rows * size
            ;
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.strokeRect(off, off, w, h)
    }
}


;stage = MainStage.go();