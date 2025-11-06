/*

*/

class StageHooks {

    constructor(stage) {
        this.stage = stage
        this.methodMap = new Map
        // Return a proxy for auto-discovery of hookable methods
        return new Proxy(this, {
            get(target, prop) {
                // Return own properties directly (for, stage, registry, cache, etc.)
                if (prop in target) {
                    return target[prop]
                }

                // console.log('prop get', prop)
                return target.resolveStack(prop)
            }
        })
    }

    resolveStack(prop) {
        if(this.methodMap.has(prop)) {
            return this.methodMap.get(prop)
        }
        // console.log('Creating')
        let hs = new HookStack
        this.methodMap.set(prop, hs)
        return hs;
    }


}


class HookStack {

    constructor() {
        this.before = new HookList
        this.after = new HookList
    }
}

class HookList {
    constructor() {
        this.items = []
    }
    add() {
        return this.items.push.apply(this.items, arguments)
    }
    remove(fn) {
        const idx = this.items.indexOf(fn)
        if (idx > -1) {
            this.items.splice(idx, 1)
        }
    }
    run() {
        this.items.forEach(f=>f(...arguments))
    }
}



// Also make the class available
Polypoint.head.install(StageHooks)

Polypoint.head.mixin('Stage', {
    drawHooks: {
        value: new HookStack
    }

});


// Install StageHooks as a deferred property on Stage
Polypoint.head.deferredProp('Stage', function hooks() {
    return new StageHooks(this)
})
