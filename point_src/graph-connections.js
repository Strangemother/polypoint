/*
title: Graph
---

This _graph chain_ stores one to one relationships, with methods to iterate
the chain in two directions. This allows use to grab the standard `A -> B -> C`,
and `C -> B -> A`.

        // some points
        const head = new Point()
        const points = new PointList(head, ...others)

        // setup connections
        const g = new GraphConnections;

        g.connect(0, 1, 2, 3, 4)
              g.connect(2, 5)
                 g.connect(5, 6, 7, 8)

Iterate one-to-one relationships (a depth of 1):

    let ps = points
    g.forPair((_a, _b)=>{
        followPoint( ps.getById(_a), ps.getById(_b), 50)
    }, this.reverse)


Provide a _forward_ function, walking thourhg the chain start from the chosen _head_:

    let head = this.g.head.uuid
    let ps = points

    let f = (key,fromKey,a)=>{
        followPoint( ps.getById(fromKey), ps.getById(key), 50)
    }

    g.getForward(head, f)

Manual iteration:

    let ps = points
    let forwardGraph = g.forward
    for(let k in forwardGraph) {
        let v = forwardGraph[k]

        for(let i of v) {
            followPoint(ps[parseInt(k)], ps[parseInt(i)], 50)
        }
    }

Capture re-visits for deeper chains.

        const graphChain = function(head, ps) {
            let visits = {}

            let pairCallback = (key, fromKey, allTargets)=>{
                constraints.distance(ps[fromKey], ps[key], 50)

                if(visits[fromKey] == undefined) { visits[fromKey] = 0 }
                if(visits[key] == undefined) { visits[key] = 0 }

                visits[fromKey] += 1
                visits[key] += 1
            }

            g.walkForward(head, pairCallback)
        }

        graphChain(head, points)

---

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

## Where it's used

The `followPoint` method allows a point to _follow_ another point, at a distance.
This is a lot like constraints but with a _one to one_ relationship in a single
direction.



*/

class GraphConnections {
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

    getChain(fromId, func) {
        let g = this.forward

        let entries = g[fromId]

        if(entries == undefined) {
            func(fromId, true)
            return
        }

        for(let k of entries) {
            func(fromId, false)
            this.getChain(k, func)
        }
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


class DirectionalGraphConnections extends GraphConnections {

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

        // if(this.forward[b] == undefined) {
        //     this.forward[b] = []
        // }

        // this.forward[b].push(a)
    }

}
