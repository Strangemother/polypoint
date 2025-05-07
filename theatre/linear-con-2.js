/*
title: Graph Chain Follow Points 2
categories: graph
    collisions
    constraints
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    dragging
    pointlist
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/constrain-distance.js
    ../point_src/constrain-distance-locked.js
    ../point_src/collisionbox.js
    stroke

---

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point(250, 150, 10)
            , new Point(400, 320, 10)
            , new Point(300, 520, 8)

            , new Point(340, 580, 8)
            , new Point(380, 520, 8)

            , new Point(410, 520, 8)
            , new Point(450, 520, 8)

            , new Point(430, 520, 8)
            , new Point(400, 520, 8)
        )

        this.collisionBox = new CollisionBox(this.points)
        this.g = new G;

        this.head = 0

        this.g.connect(0, 1, 2, 3, 4)
        this.g.connect(2, 5)
        this.g.connect(5, 6, 7, 8)

        this.dragging.add(...this.points)
    }

    onMousedown(ev, p) {
        // console.log(this.dragging._near)
        this.head = this.points.indexOf(this.dragging._near)
    }

    draw(ctx){
        this.clear(ctx)
        this.collisionBox.shuffle()

        // let mouse = Point.mouse.position
        // followPoint(mouse, this.points[0], 50)

        this.graphChain2()
        this.points.pen.indicators(ctx)

        // head
        this.points[0].pen.fill(ctx, '#992211')
        // tri joint
        this.points[2].pen.fill(ctx, '#00cc33')
    }

    graphChain2() {
        let head = this.head
        let ps = this.points
        let visits = {}

        let pairCallback = (key, fromKey, allTargets)=>{
            // console.log('from=', fromKey, 'key=', key, )
            // constraints.within(ps[fromKey], ps[key], 50)


            constraints.distance(ps[fromKey], ps[key], 50)

            if(visits[fromKey] == undefined) { visits[fromKey] = 0 }
            if(visits[key] == undefined) { visits[key] = 0 }

            visits[fromKey] += 1
            visits[key] += 1
        }

        this.g.walkForward(head, pairCallback)
    }

}


class G {
    constructor(){
        this.forward = {}
        this.reverse = {}
        /* neighbours by connections.
        When reversing; we grab the rear node,
        and in reverse, we iterate siblings. */
        this.siblings = {}
    }

    connect(...items){
        /* split an array into overlapping pairs

            [0,1,2,3,4,5]
            [0,1]
            [1,2]
            [2,3]
            ...
        */
        for(let i = 0; i < items.length; i += 1) {
            let [a,b] = items.slice(i-1, i+1);
            this.add(a, b)
        }
        // this.g.add(pid(a), pid(b))
    }

    add(a, b) {
        /* Add forward.

        this builds the following:

        {
            "0": [1 ],
            "1": [0, 2 ],
            "2": [1, 3, 5],
            "3": [2, 4],
            "4": [3 ],
            "5": [2, 6],
            "6": [5 ]
        }

        For connections, we walk (from a key numer) in a direction, generating pairs.
        Some keys will fork - but that should generated the connected pair set.

        e.g, pulling '3',

            3 -> 2, 4
                    4 -> [3]      <= not executed,
                 2 -> 1, [3], 5   <= skip 3, as "2"
                      1 -> 0, 2   <= skip 2, as "1"
                             ...
        */
        if(this.forward[a] == undefined) {
            this.forward[a] = []
        }

        this.forward[a].push(b)

        if(this.forward[b] == undefined) {
            this.forward[b] = []
        }

        this.forward[b].push(a)
    }

    walkForward(fromId, func, previousId, count=0, maxCount) {
        let g = this.forward
        if(maxCount == undefined) { maxCount = 11 }
        if(count >= maxCount) {
            console.log('Kill depth')
            return
        }
        let entries = g[fromId]
        if(entries == undefined) {
            return
        }

        for(let k of entries) {
            if(previousId == k) {
                /* This is back through the original chain.*/
                continue
            }
            func(k, fromId, entries)
            this.walkForward(k, func, fromId, count+=1)
        }
    }

    forPair(func, reverse=false) {
        let g = this.forward
        // if(reverse == true) {
        //     g = this.reverse
        // }

        for(let k in g) {
            let v = g[k]
            for(let i of v) {
                if(i == k) {
                    /* reverse chain*/
                    continue
                }
                func(k, i)
            }
        }

    }
}

stage = MainStage.go(/*{ loop: true }*/)
