/*
title: Graph Chain Follow Points
categories:
    raw
    graph
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
    ../point_src/constrain-distance-locked.js
    ../point_src/collisionbox.js
    stroke

---

> [!NOTE]
> V3 is better.

The `followPoint` method allows a point to _follow_ another point, at a distance.
This is a lot like constraints but with a _one to one_ relationship in a single
direction.

This _graph chain_ stores those one to one relationships, with methods to iterate
the chain in two directions. This allows use to grab the standard `A -> B -> C`,
and `C -> B -> A`.

The graph can resolve a "star based" configuration:

    A      C
      \   /
        B
        |
        D
        |
        E

Each connection is given in a pair, from an origin node (the `head`)

    head = B

    B -> C
    B -> D [ -> E ]
    D -> E
    B -> A


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

        this.reverse = true
        this.collisionBox = new CollisionBox(this.points)

        this.g = new G;
        // let forwardGraph = {
        //       0: [1]
        //     , 1: [2]
        //     , 2: [3, 5]
        //     , 3: [4]
        //     , 5: [6]
        // }
        const pid = (v) => this.points[v].uuid
        this.g.head = this.points[0]

        console.log(0, pid(0))

        let con = (a,b) => this.g.add(pid(a), pid(b))

        con(0, 1)
        con(1, 2)

        con(2, 3)
        con(2, 5)

        con(3, 4)
        con(5, 6)
        con(6, 7)
        con(7, 8)
        // this.g.add(1, 2)
        // this.g.add(2, 3)
        // this.g.add(2, 5)
        // this.g.add(3, 4)
        // this.g.add(5, 6)

        // this.g.forward = forwardGraph
        this.dragging.add(...this.points)
    }

    onMousedown(ev, p) {
        // console.log(this.dragging._near)
        this.g.head = this.dragging._near
    }

    draw(ctx){
        this.clear(ctx)
        this.collisionBox.shuffle()

        // let mouse = Point.mouse.position
        // followPoint(mouse, this.points[0], 50)

        this.graphChain2()
        // this.manualLoop()
        // this.functional()

        this.points.pen.indicators(ctx)

        // head
        this.points[0].pen.fill(ctx, '#992211')
        // tri joint
        this.points[2].pen.fill(ctx, '#00cc33')

    }

    graphChain2() {
        let head = this.g.head?.uuid
        if(head == undefined) {
            return
        }
        // console.log('Head', head)
        let ps = this.points
        let f = (key,fromKey,a)=>{
            // console.log('from=', fromKey, 'key=', key, )
            followPoint( ps.getById(fromKey), ps.getById(key), 50)
        }

        this.g.getForward(head, f)
    }

    graphChain() {

        let ps = this.points
        this.g.forPair((_a, _b)=>{
            followPoint( ps.getById(_a), ps.getById(_b), 50)
        }, this.reverse)
    }

    manualLoop(){

        let ps = this.points
        let forwardGraph = this.g.forward
        for(let k in forwardGraph) {
            let v = forwardGraph[k]

            for(let i of v) {
                followPoint(ps[parseInt(k)], ps[parseInt(i)], 50)
            }
        }
    }

    functional() {
        followPoint(this.points[0], this.points[1], 50)
        followPoint(this.points[1], this.points[2], 50)

        followPoint(this.points[2], this.points[3], 50)
        followPoint(this.points[3], this.points[4], 50)

        followPoint(this.points[2], this.points[5], 50)
        followPoint(this.points[5], this.points[6], 50)
    }
}


class G {
    /* v3 is better. */
    constructor(){
        this.forward = {}
        this.reverse = {}

        /* neighbours by connections.
        When reversing; we grab the rear node,
        and in reverse, we iterate siblings. */
        this.siblings = {}
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

    getForward(fromId, func, previousId, count=0) {
        let g = this.forward
            if(count > 10) {
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
            this.getForward(k, func, fromId, count+=1)
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
                // func(parseInt(k), parseInt(i))
            }
        }

    }
}

stage = MainStage.go(/*{ loop: true }*/)
