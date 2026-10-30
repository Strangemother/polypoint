/*
title: Chromites V2
files:
    head
    pointlist
    point
    ../point_src/stage.js
    mouse
    dragging
    stroke
---

Chromites swim, seek food and similar colours, merge, and burst into offspring.
Drag them together, long-click to sprinkle food, or use the buttons to add food
and newcomers.

Create a creature with `new Chromite({x, y, mass, hue, genes, ...})`.
Options become instance properties; `genes` may contain any subset of the
genetic traits. Mass defaults to 1, and radius defaults to 4 * sqrt(mass).
For example:

    const swimmer = new Chromite({
        x: 100, y: 120, hue: 210, mass: 2,
        genes: {speed: 2, sociability: .8}, burstHunger: 1200
    })
    stage.world.add(swimmer)

Options are mutable instance properties. `genes` contains aggression, fear,
speed, turnRate, curiosity, metabolism, longevity, digestion and sociability.
The instance also exposes `energyMax`, `foodSeekEnergy`, `desperateEnergy`,
`lifespanBase`, `mateHueMix`, `mateRange`, `minNeighbourTrack`,
`maxNeighbourTrack`, `mergeHueDiff`, `burstMinMass`, `burstHunger`,
`burstMinEnergy`, `speedScale` and `overrideColor`. See the constructor for
their defaults. Explicit `energy`, `age`, `lifespan`, `hunger`, `cool`, and
other initial state can also be supplied.

Call `chromite.render(ctx)` to draw it. A ChromiteWorld owns the population,
food and generations; `world.add(chromite)` registers a creature. Pass
`ChromiteClass` to the world to use a subclass for seeded creatures, arrivals
and germination. For example:

    class MyChromite extends Chromite {
        render(ctx) { super.render(ctx) }
    }
    const world = new ChromiteWorld({canvas: stage.canvas, ChromiteClass: MyChromite})
    world.add(new MyChromite({x: 100, y: 120}))

Override `step(world)`, `render(ctx)` or `createOffspring(options)` to
customize behaviour. Offspring retain their parent's class and configurable
settings, and their generation is one greater; override `createOffspring` to
pass on additional custom properties. The stage steps and renders its world
once per frame; another world needs its own `step()` and `render(ctx)` calls.
Smaller hooks such as `seekFood`, `avoidThreat`, `move`, `renderTail` and
`renderBody` can be overridden independently. The inheritance bounds and
mutation amounts are defined in `Chromite.geneRules`; override `randomGenes`
as well when introducing a new genetic trait.
*/

class Chromite extends Point {
    static nextId = 0

    // Mutation bounds differ from the ranges used for the initial population.
    static geneRules = {
        aggression:  {min: 0,    max: 1,   variation: .25},
        fear:        {min: 0,    max: 1,   variation: .25},
        speed:       {min: .12,  max: 5.2, variation: 1.25},
        turnRate:    {min: .008, max: .5,  variation: .085},
        curiosity:   {min: 0,    max: 1,   variation: .25},
        metabolism:  {min: .25,  max: 2.1, variation: .28},
        longevity:   {min: .45,  max: 2.1, variation: .28},
        digestion:   {min: .55,  max: 2,   variation: .28},
        sociability: {min: 0,    max: 1,   variation: .25}
    }

    constructor(options = {}) {
        const mass = options.mass ?? 1
        super({x: 0, y: 0, radius: 4 * Math.sqrt(mass), ...options})
        if (options.uuid === undefined) this.uuid = `chromite-${Chromite.nextId++}`
        this.mass = mass
        this.genes = {...this.constructor.randomGenes(), ...options.genes}
        this.hue = options.hue ?? Math.floor(Math.random() * 12) * 30
        this.vx = options.vx ?? 0
        this.vy = options.vy ?? 0
        this.speedScale = options.speedScale ?? 1
        this.energyMax = options.energyMax ?? 150
        this.foodSeekEnergy = options.foodSeekEnergy ?? 90
        this.desperateEnergy = options.desperateEnergy ?? 35
        this.lifespanBase = options.lifespanBase ?? 3000
        this.energy = options.energy ?? 80 + Math.random() * 40
        this.age = options.age ?? 0
        this.lifespan = options.lifespan ?? Math.round(this.lifespanBase * this.genes.longevity)
        this.maturity = options.maturity ?? 0
        this.digestTimer = options.digestTimer ?? 0
        this.cool = options.cool ?? 0
        this.hunger = options.hunger ?? 0
        this.mateHueMix = options.mateHueMix ?? 200
        this.mateRange = options.mateRange ?? 175
        this.minNeighbourTrack = options.minNeighbourTrack ?? 1
        this.maxNeighbourTrack = options.maxNeighbourTrack ?? 10
        this.mergeHueDiff = options.mergeHueDiff ?? 18
        this.burstMinMass = options.burstMinMass ?? 1.5
        this.burstHunger = options.burstHunger ?? 800
        this.burstMinEnergy = options.burstMinEnergy ?? 25
        this.overrideColor = options.overrideColor
        this.generation = options.generation ?? 0
    }

    static randomGenes() {
        return {
            aggression: Math.random(),
            fear: Math.random(),
            speed: .12 + Math.pow(Math.random(), .85) * 5.1,
            turnRate: .008 + Math.random() * .48,
            curiosity: Math.random(),
            metabolism: .25 + Math.random() * 1.85,
            longevity: 3.45 + Math.random() * 1.65,
            digestion: .35 + Math.random() * 1.45,
            sociability: Math.random()
        }
    }

    static inheritGenes(parent, other, weight = 1) {
        const genes = {}
        // One roll chooses a fresh value, a larger mutation, or a regular mutation.
        const rerollCutoff = .22
        const largeMutationCutoff = .5
        for (const [name, rule] of Object.entries(this.geneRules)) {
            let center = parent[name]
            if (other) {
                center = parent[name] * weight + other[name] * (1 - weight)
            }

            const roll = Math.random()
            let candidate
            if (roll < rerollCutoff) {
                candidate = rule.min + Math.random() * (rule.max - rule.min)
            } else {
                const mutationSize = roll < largeMutationCutoff ? 2 : 1
                const mutation = (Math.random() + Math.random() - 1) * rule.variation * mutationSize
                candidate = center + mutation
            }
            genes[name] = Math.max(rule.min, Math.min(rule.max, candidate))
        }
        return genes
    }

    step(world) {
        this.updateLife()
        const neighbours = this.findNeighbours(world)
        const desperation = this.getDesperation()
        const desperate = this.energy < this.desperateEnergy
        this.seekFood(world, desperate, desperation)
        this.wanderWhenHungry(desperate, desperation)
        this.seekNeighbours(world, neighbours, desperate)
        this.avoidThreat(world, neighbours.threat, neighbours.threatScore)
        this.move(world, desperation)
    }

    updateLife() {
        if (this.cool > 0) this.cool--
        if (this.digestTimer > 0) this.digestTimer--
        this.hunger++
        this.age++

        const activity = Math.hypot(this.vx, this.vy)
        const sizeFactor = Math.max(.65, Math.min(1.65, Math.pow(Math.max(.05, this.mass), .25)))
        const energyCost = (.005 + activity * .004 + this.genes.aggression * .004) *
            this.genes.metabolism * sizeFactor
        this.energy = Math.max(0, Math.min(this.energyMax, this.energy - energyCost))
    }

    findNeighbours(world) {
        const width = world.canvas.width
        const height = world.canvas.height
        const mates = []
        let friend = null
        let bestFriendScore = Infinity
        let threat = null
        let threatScore = 0

        for (const other of world.points) {
            if (this === other) continue
            const dx = world.wrapDelta(this.x, other.x, width)
            const dy = world.wrapDelta(this.y, other.y, height)
            const distance = Math.hypot(dx, dy) || .001
            const hueDifference = world.hueDiff(this.hue, other.hue)

            const danger = other.radius / Math.max(1, this.radius) * other.genes.aggression
            const threatRange = 18 + this.radius * 4 + 50 * this.genes.fear
            if (danger > .45 && distance < threatRange) {
                const intensity = (threatRange - distance) / threatRange * danger
                if (intensity > threatScore) {
                    threatScore = intensity
                    threat = other
                }
            }

            const friendScore = hueDifference * 3 + distance * .12 -
                this.genes.curiosity * (1 - Math.min(1, distance / 180)) * 18
            if (friendScore < bestFriendScore) {
                bestFriendScore = friendScore
                friend = other
            }
            if (hueDifference < this.mateHueMix && distance < this.mateRange && this.genes.sociability > .12) {
                mates.push({chromite: other, score: distance + hueDifference * .7})
            }

            // Separation is applied while inspecting the neighbours.
            this.repelNeighbour(other, dx, dy, distance)
        }
        return {mates, friend, threat, threatScore}
    }

    repelNeighbour(other, dx, dy, distance) {
        const personalSpace = 20 + this.radius + other.radius
        if (distance >= personalSpace) return
        const force = (personalSpace - distance) / personalSpace * .13 *
            this.speedScale * (1 + .6 * this.genes.fear)
        this.vx -= dx / distance * force
        this.vy -= dy / distance * force
    }

    getDesperation() {
        if (this.foodSeekEnergy <= 0) return 0
        const hunger = (this.foodSeekEnergy - this.energy) / this.foodSeekEnergy
        return Math.pow(Math.max(0, Math.min(1, hunger)), 2)
    }

    foodQuality(food, world, desperate) {
        const dx = world.wrapDelta(this.x, food.x, world.canvas.width)
        const dy = world.wrapDelta(this.y, food.y, world.canvas.height)
        const distance = Math.hypot(dx, dy)
        const range = desperate ? 300 : 160
        if (distance > range) return 0
        if (desperate) return 1 / (12 + distance)
        const massPreference = .65 + Math.min(1.35, this.mass * .18)
        return Math.pow(Math.max(.02, food.mass), massPreference) / (24 + distance)
    }

    seekFood(world, desperate, desperation) {
        const {nutrients, canvas} = world
        if (this.digestTimer > 0 || this.energy >= this.foodSeekEnergy || !nutrients.length) {
            this.foodTarget = null
            this.foodCommit = 0
            return
        }

        let bestFood = null
        let bestScore = 0
        for (const food of nutrients) {
            const score = this.foodQuality(food, world, desperate)
            if (score > bestScore) {
                bestFood = food
                bestScore = score
            }
        }
        const current = this.foodTarget
        const currentScore = current && nutrients.includes(current) ?
            this.foodQuality(current, world, desperate) : 0
        if (!currentScore || (this.foodCommit || 0) <= 0 ||
            (bestFood !== current && bestScore > currentScore * 1.65)) {
            this.foodTarget = bestFood
            this.foodCommit = 24 + Math.floor(Math.random() * 17)
        }
        this.foodCommit--
        if (!this.foodTarget) return

        const dx = world.wrapDelta(this.x, this.foodTarget.x, canvas.width)
        const dy = world.wrapDelta(this.y, this.foodTarget.y, canvas.height)
        const distance = Math.hypot(dx, dy) || 1
        if (distance < (desperate ? 300 : 160)) {
            const drive = .025 + .16 * desperation
            this.vx += dx / distance * drive * this.speedScale
            this.vy += dy / distance * drive * this.speedScale
        }
    }

    wanderWhenHungry(desperate, desperation) {
        if (!desperate || this.foodTarget) return
        if (!Number.isFinite(this.wanderHeading) || (this.wanderTimer || 0) <= 0) {
            this.wanderHeading = Math.random() * Math.PI * 2
            this.wanderTimer = 45 + Math.floor(Math.random() * 75)
        }
        this.wanderTimer--
        const urge = (.025 + .09 * desperation) * this.speedScale
        this.vx += Math.cos(this.wanderHeading) * urge
        this.vy += Math.sin(this.wanderHeading) * urge
    }

    seekNeighbours(world, {mates, friend}, desperate) {
        if (desperate) return
        const width = world.canvas.width
        const height = world.canvas.height
        const neighbourLimit = this.genes.sociability > .55 ? this.maxNeighbourTrack : this.minNeighbourTrack
        if (mates.length && this.genes.sociability > .12 && neighbourLimit >= 1) {
            mates.sort((a, b) => a.score - b.score)
            const count = Math.min(mates.length, Math.floor(neighbourLimit))
            let dx = 0
            let dy = 0
            let averageVx = 0
            let averageVy = 0
            for (let i = 0; i < count; i++) {
                const other = mates[i].chromite
                dx += world.wrapDelta(this.x, other.x, width)
                dy += world.wrapDelta(this.y, other.y, height)
                averageVx += other.vx
                averageVy += other.vy
            }
            dx /= count
            dy /= count
            averageVx /= count
            averageVy /= count
            const distance = Math.hypot(dx, dy) || 1
            const pull = .025 + .07 * this.genes.sociability
            this.vx += dx / distance * pull * this.speedScale + (averageVx - this.vx) * .015 * this.genes.sociability
            this.vy += dy / distance * pull * this.speedScale + (averageVy - this.vy) * .015 * this.genes.sociability
        } else if (friend) {
            const dx = world.wrapDelta(this.x, friend.x, width)
            const dy = world.wrapDelta(this.y, friend.y, height)
            const distance = Math.hypot(dx, dy) || 1
            const chase = .055 * this.speedScale * (.35 + 1.5 * this.genes.aggression)
            this.vx += dx / distance * chase
            this.vy += dy / distance * chase
        }
    }

    avoidThreat(world, threat, threatScore) {
        if (!threat) return
        const dx = -world.wrapDelta(this.x, threat.x, world.canvas.width)
        const dy = -world.wrapDelta(this.y, threat.y, world.canvas.height)
        const distance = Math.hypot(dx, dy) || 1
        const flee = .14 * this.genes.fear * threatScore * this.speedScale
        this.vx += dx / distance * flee
        this.vy += dy / distance * flee
    }

    move(world, desperation) {
        this.vx += (Math.random() - .5) * .08 * this.speedScale
        this.vy += (Math.random() - .5) * .08 * this.speedScale
        this.vx *= .97
        this.vy *= .97
        this.burstCooldown = Math.max(0, (this.burstCooldown || 0) - 1)
        this.burstFrames = Math.max(0, (this.burstFrames || 0) - 1)
        if (this.mass < .8 && this.foodTarget && this.burstCooldown === 0 && this.energy > 8) {
            this.burstFrames = 10
            this.burstCooldown = 110 + Math.floor(Math.random() * 75)
        }

        const speed = Math.hypot(this.vx, this.vy)
        const cruiseFactor = Math.max(.72, Math.min(1.30, .86 + .20 * Math.sqrt(Math.max(.05, this.mass))))
        const limit = 2.3 * this.speedScale * this.genes.speed * (.30 + .30 * desperation) *
            cruiseFactor * (this.burstFrames > 0 ? 1.55 : 1)
        if (speed > limit) {
            this.vx *= limit / speed
            this.vy *= limit / speed
        }
        if (Math.hypot(this.vx, this.vy) > .03) {
            const target = Math.atan2(this.vy, this.vx)
            if (!Number.isFinite(this.radians)) this.radians = target
            const delta = Math.atan2(Math.sin(target - this.radians), Math.cos(target - this.radians))
            this.radians += Math.max(-this.genes.turnRate, Math.min(this.genes.turnRate, delta))
            const magnitude = Math.hypot(this.vx, this.vy)
            this.vx = Math.cos(this.radians) * magnitude
            this.vy = Math.sin(this.radians) * magnitude
        }
        this.x += this.vx + (this.knockX || 0)
        this.y += this.vy + (this.knockY || 0)
        this.knockX = (this.knockX || 0) * .88
        this.knockY = (this.knockY || 0) * .88
        if (Math.abs(this.knockX) < .015) this.knockX = 0
        if (Math.abs(this.knockY) < .015) this.knockY = 0
        this.wrap(world)
    }

    wrap(world) {
        const width = world.canvas.width
        const height = world.canvas.height
        let wrapped = false
        if (this.x < -this.radius) {
            this.x = width + this.radius
            wrapped = true
        }
        if (this.x > width + this.radius) {
            this.x = -this.radius
            wrapped = true
        }
        if (this.y < -this.radius) {
            this.y = height + this.radius
            wrapped = true
        }
        if (this.y > height + this.radius) {
            this.y = -this.radius
            wrapped = true
        }
        if (wrapped) this.tail = null
    }

    eat(food, world) {
        if (Number.isFinite(food.hue)) this.hue = world.wheelStep(this.hue, food.hue, .38)
        this.mass += food.mass
        this.radius = Math.min(17, 4 * Math.sqrt(this.mass))
        this.energy = Math.min(this.energyMax, this.energy + Math.max(8, food.mass * 45))
        this.hunger = 0
        this.digestTimer = Math.round(35 + 90 * this.genes.digestion)
    }

    createOffspring(options) {
        return new this.constructor({
            mateHueMix: this.mateHueMix,
            mateRange: this.mateRange,
            minNeighbourTrack: this.minNeighbourTrack,
            maxNeighbourTrack: this.maxNeighbourTrack,
            mergeHueDiff: this.mergeHueDiff,
            burstMinMass: this.burstMinMass,
            burstHunger: this.burstHunger,
            burstMinEnergy: this.burstMinEnergy,
            energyMax: this.energyMax,
            foodSeekEnergy: this.foodSeekEnergy,
            desperateEnergy: this.desperateEnergy,
            lifespanBase: this.lifespanBase,
            speedScale: this.speedScale,
            overrideColor: this.overrideColor,
            generation: this.generation + 1,
            ...options
        })
    }

    updateTail() {
        const count = 7
        const spacing = Math.max(1.1, this.radius * .48)
        if (!this.tail) {
            const angle = this.radians || 0
            this.tail = Array.from({length: count}, (_, i) => ({
                x: this.x - Math.cos(angle) * spacing * (i + 1),
                y: this.y - Math.sin(angle) * spacing * (i + 1)
            }))
            this.swimPhase = Math.random() * Math.PI * 2
        }
        const speed = Math.hypot(this.vx, this.vy)
        this.swimPhase += .09 + Math.min(.22, speed * .055)
        let leader = this
        const angle = this.radians || 0
        for (let i = 0; i < this.tail.length; i++) {
            const segment = this.tail[i]
            let dx = segment.x - leader.x
            let dy = segment.y - leader.y
            let distance = Math.hypot(dx, dy)
            if (distance < .00001) {
                dx = -Math.cos(angle)
                dy = -Math.sin(angle)
                distance = 1
            }
            const wave = Math.sin(this.swimPhase - i * .72) * (i + 1) / count *
                Math.min(2.25, this.radius * .5) * Math.min(1, speed / 1.2)
            segment.x += (leader.x + dx / distance * spacing - Math.sin(angle) * wave - segment.x) * .55
            segment.y += (leader.y + dy / distance * spacing + Math.cos(angle) * wave - segment.y) * .55
            leader = segment
        }
    }

    render(ctx) {
        this.updateTail()
        ctx.save()
        this.renderTail(ctx)
        this.renderBody(ctx)
        ctx.restore()
    }

    renderTail(ctx) {
        ctx.strokeStyle = this.overrideColor ?? `hsla(${this.hue} 85% 67% / .82)`
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        let previous = this
        for (let i = 0; i < this.tail.length; i++) {
            const next = this.tail[i]
            const progress = i / Math.max(1, this.tail.length - 1)
            ctx.lineWidth = Math.max(.55, this.radius * (.82 - .69 * progress))
            ctx.beginPath()
            ctx.moveTo(previous.x, previous.y)
            ctx.lineTo(next.x, next.y)
            ctx.stroke()
            previous = next
        }
    }

    renderBody(ctx) {
        const lightness = Math.max(33, 65 - this.age / this.lifespan * 18)
        ctx.beginPath()
        ctx.arc(this.x, this.y, Math.max(.8, this.radius * .66), 0, Math.PI * 2)
        ctx.fillStyle = this.overrideColor ?? `hsl(${this.hue} 85% ${lightness}%)`
        ctx.fill()
    }
}

class ChromiteWorld {
    constructor({canvas, dragging, ChromiteClass = Chromite, maxPopulation = 20, overrideColor} = {}) {
        this.canvas = canvas
        this.dragging = dragging
        this.ChromiteClass = ChromiteClass
        this.maxPopulation = maxPopulation
        this.overrideColor = overrideColor
        this.points = new PointList()
        this.nutrients = []
        this.ripples = []
        this.shockwaves = []
    }

    add(...chromites) {
        if (chromites.some(chromite => !(chromite instanceof Chromite))) {
            throw new TypeError('ChromiteWorld accepts Chromite instances')
        }
        if (new Set(chromites).size !== chromites.length ||
            chromites.some(chromite => this.points.includes(chromite))) {
            throw new Error('Chromite is already in this world')
        }
        const ids = new Set(Array.from(this.points, chromite => chromite.uuid))
        for (const chromite of chromites) {
            if (ids.has(chromite.uuid)) throw new Error(`Duplicate chromite uuid: ${chromite.uuid}`)
            ids.add(chromite.uuid)
        }
        if (this.points.length + chromites.length > this.maxPopulation) {
            throw new RangeError('ChromiteWorld population limit exceeded')
        }
        this.points.push(...chromites)
        this.dragging?.add(...chromites)
    }

    makeFood(x, y, mass = .25, hue = null) {
        this.nutrients.push({
            x,
            y,
            mass,
            hue,
            vx: (Math.random() - .5) * .32,
            vy: (Math.random() - .5) * .32,
            phase: Math.random() * 6.283
        })
    }

    recycle(chromite) {
        const count = Math.max(1, Math.min(6, Math.ceil(chromite.mass / .25)))
        for (let i = 0; i < count; i++) {
            const x = chromite.x + (Math.random() - .5) * 10
            const y = chromite.y + (Math.random() - .5) * 10
            this.makeFood(x, y, chromite.mass / count, chromite.hue)
        }
    }

    popShockwave(source, strength = 1) {
        const radius = 56 + Math.min(105, source.radius * 5)
        this.shockwaves.push({x: source.x, y: source.y, r: 0, radius, strength, age: 0, duration: 13})
        this.ripples.push({x: source.x, y: source.y, r: 3, life: 17, maxLife: 17})
    }

    advanceShockwaves() {
        const width = this.canvas.width
        const height = this.canvas.height
        for (const wave of this.shockwaves) {
            const previousRadius = wave.r
            wave.age++
            wave.r = wave.radius * Math.min(1, wave.age / wave.duration)
            for (const chromite of this.points) {
                const dx = this.wrapDelta(wave.x, chromite.x, width)
                const dy = this.wrapDelta(wave.y, chromite.y, height)
                const distance = Math.hypot(dx, dy)
                if (distance > previousRadius && distance <= wave.r + 5) {
                    const theta = distance < .001 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx)
                    const near = 1 - Math.min(1, distance / wave.radius)
                    const shove = (5 + Math.pow(near, 1.2) * 33) * wave.strength
                    chromite.knockX = (chromite.knockX || 0) + Math.cos(theta) * shove * .14
                    chromite.knockY = (chromite.knockY || 0) + Math.sin(theta) * shove * .14
                }
            }
        }
        this.shockwaves = this.shockwaves.filter(wave => wave.age < wave.duration)
    }

    driftFood() {
        const width = this.canvas.width
        const height = this.canvas.height
        for (const food of this.nutrients) {
            food.phase += .012
            food.vx = Math.max(-.36, Math.min(.36,
                food.vx * .985 + Math.sin(food.phase) * .002 + (Math.random() - .5) * .006))
            food.vy = Math.max(-.36, Math.min(.36,
                food.vy * .985 + Math.cos(food.phase * .83) * .002 + (Math.random() - .5) * .006))
            food.x = (food.x + food.vx + width) % width
            food.y = (food.y + food.vy + height) % height
        }
    }

    germinate() {
        if (this.points.length >= Math.min(8, this.maxPopulation) || !this.nutrients.length) return
        if (this.points.length > 0 && Math.random() > .04) return
        const food = this.nutrients.shift()
        this.add(new this.ChromiteClass({
            x: food.x,
            y: food.y,
            radius: Math.max(1, 4 * Math.sqrt(food.mass)),
            mass: food.mass,
            energy: 40,
            vx: (Math.random() - .5) * .7,
            vy: (Math.random() - .5) * .7,
            cool: 60
        }))
    }

    addChromies() {
        const count = Math.min(Math.max(0, this.maxPopulation - this.points.length),
            3 + Math.floor(Math.random() * 4))
        const width = this.canvas.width
        const height = this.canvas.height
        const newcomers = []
        for (let i = 0; i < count; i++) {
            const mass = .25 + Math.random() * .75
            const radius = 4 * Math.sqrt(mass)
            const angle = Math.random() * Math.PI * 2
            newcomers.push(new this.ChromiteClass({
                x: radius + Math.random() * Math.max(1, width - 2 * radius),
                y: radius + Math.random() * Math.max(1, height - 2 * radius),
                mass,
                radius,
                hue: Math.random() * 360,
                vx: Math.cos(angle) * (.35 + Math.random() * .8),
                vy: Math.sin(angle) * (.35 + Math.random() * .8),
                radians: angle,
                cool: 45
            }))
        }
        this.add(...newcomers)
    }

    sprinkleFood(x, y, amount = 14) {
        const width = this.canvas.width
        const height = this.canvas.height
        for (let i = 0; i < amount; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.sqrt(Math.random()) * 32
            const foodX = (x + Math.cos(angle) * radius + width) % width
            const foodY = (y + Math.sin(angle) * radius + height) % height
            this.makeFood(foodX, foodY, .12)
        }
    }

    seed() {
        const width = this.canvas.width
        const height = this.canvas.height
        for (let i = 0; i < 80; i++) {
            this.makeFood(Math.random() * width, Math.random() * height, .25)
        }
        const chromites = []
        const available = Math.max(0, this.maxPopulation - this.points.length)
        for (let i = 0; i < 28 && chromites.length < available; i++) {
            const angle = i * Math.PI * 2 / 28
            const distance = 95 + (i % 6) * 25
            chromites.push(new this.ChromiteClass({
                x: width / 2 + Math.cos(angle) * distance,
                y: height / 2 + Math.sin(angle) * distance,
                mass: 1,
                vx: (Math.random() - .5) * 2,
                vy: (Math.random() - .5) * 2
            }))
        }
        for (let i = 0; i < 200 && chromites.length < available; i++) {
            chromites.push(new this.ChromiteClass({
                x: 8 + Math.random() * Math.max(1, width - 16),
                y: 8 + Math.random() * Math.max(1, height - 16),
                mass: .25,
                vx: (Math.random() - .5) * .8,
                vy: (Math.random() - .5) * .8
            }))
        }
        this.add(...chromites)
    }

    hueDiff(a, b) {
        const d = Math.abs(a - b) % 360
        return Math.min(d, 360 - d)
    }

    wheelStep(a, b, fraction = .5) {
        const arc = ((b - a + 540) % 360) - 180
        return (a + arc * fraction + 360) % 360
    }

    mixHue(a, b) {
        const x = Math.cos(a * Math.PI / 180) + Math.cos(b * Math.PI / 180)
        const y = Math.sin(a * Math.PI / 180) + Math.sin(b * Math.PI / 180)
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
    }

    wrapDelta(a, b, size) {
        return ((b - a + size * 1.5) % size) - size * .5
    }

    merge(survivor, other) {
        const totalMass = survivor.mass + other.mass
        survivor.x = (survivor.x * survivor.mass + other.x * other.mass) / totalMass
        survivor.y = (survivor.y * survivor.mass + other.y * other.mass) / totalMass
        survivor.vx = (survivor.vx * survivor.mass + other.vx * other.mass) / totalMass
        survivor.vy = (survivor.vy * survivor.mass + other.vy * other.mass) / totalMass
        survivor.radians = Math.atan2(survivor.vy, survivor.vx)
        survivor.hue = this.mixHue(survivor.hue, other.hue)
        survivor.genes = survivor.constructor.inheritGenes(survivor.genes, other.genes, survivor.mass / totalMass)
        survivor.energy = Math.min(survivor.energyMax, survivor.energy + other.energy * .65)
        survivor.lifespan = Math.round(survivor.lifespanBase * survivor.genes.longevity)
        survivor.mass = totalMass
        survivor.radius = Math.min(17, 4 * Math.sqrt(totalMass))
        survivor.cool = 25
        survivor.hunger = 0
        survivor.digestTimer = Math.max(survivor.digestTimer, other.digestTimer)
    }

    burst(parent, population) {
        const maxPieces = Math.min(10, Math.floor(parent.mass / .20), this.maxPopulation - population + 1)
        if (maxPieces < 2) return []

        const possiblePieces = Math.max(1, Math.min(7, Math.floor(parent.mass / .25)) - 1)
        const baseCount = 2 + Math.floor(Math.random() * possiblePieces)
        const count = Math.max(2, Math.min(maxPieces, Math.round(baseCount * 1.3)))
        const weights = Array.from({length: count}, () => .3 + Math.random() * 2)
        const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
        let remainingMass = parent.mass
        const baseAngle = Math.random() * Math.PI * 2
        const offspring = []
        const width = this.canvas.width
        const height = this.canvas.height
        for (let i = 0; i < count; i++) {
            const mass = i === count - 1 ? remainingMass : parent.mass * weights[i] / weightSum
            remainingMass -= mass
            const radius = Math.max(1, Math.min(17, 4 * Math.sqrt(mass)))
            const theta = baseAngle + i * 2 * Math.PI / count
            const offset = parent.radius + radius + 2
            const vx = parent.vx + Math.cos(theta) * .7
            const vy = parent.vy + Math.sin(theta) * .7
            offspring.push(parent.createOffspring({
                x: Math.max(radius, Math.min(width - radius, parent.x + Math.cos(theta) * offset)),
                y: Math.max(radius, Math.min(height - radius, parent.y + Math.sin(theta) * offset)),
                radius,
                mass,
                genes: parent.constructor.inheritGenes(parent.genes),
                hue: this.offspringHue(parent),
                vx,
                vy,
                radians: Math.atan2(vy, vx),
                cool: 45
            }))
        }
        this.popShockwave(parent, Math.min(1.35, .7 + parent.mass * .09))
        return offspring
    }

    offspringHue(parent) {
        if (Math.random() < .65) return Math.random() * 360
        const variation = (Math.random() + Math.random() - 1) * 300
        const target = (parent.hue + variation + 360) % 360
        return this.wheelStep(parent.hue, target, .85)
    }

    step() {
        this.driftFood()
        this.advanceShockwaves()
        for (const chromite of this.points) chromite.step(this)

        this.feedChromites()
        const removed = this.resolveCollisions()
        const newborns = this.spawnOffspring(removed)
        this.recycleExpired(removed)
        this.replacePopulation(removed, newborns)
        this.germinate()
    }

    feedChromites() {
        const width = this.canvas.width
        const height = this.canvas.height
        const eaten = new Set()
        for (const chromite of this.points) {
            if (chromite.digestTimer > 0) continue
            for (const food of this.nutrients) {
                if (eaten.has(food)) continue
                const dx = Math.abs(food.x - chromite.x)
                const dy = Math.abs(food.y - chromite.y)
                const distance = Math.hypot(Math.min(dx, width - dx), Math.min(dy, height - dy))
                if (distance < chromite.radius + 2) {
                    eaten.add(food)
                    chromite.eat(food, this)
                    break
                }
            }
        }
        if (eaten.size) this.nutrients = this.nutrients.filter(food => !eaten.has(food))
    }

    resolveCollisions() {
        const removed = new Set()
        for (let i = 0; i < this.points.length; i++) {
            const first = this.points[i]
            if (removed.has(first)) continue
            for (let j = i + 1; j < this.points.length; j++) {
                const second = this.points[j]
                if (removed.has(second) || first.cool || second.cool) continue
                const dx = second.x - first.x
                const dy = second.y - first.y
                const distance = Math.hypot(dx, dy)
                if (distance >= first.radius + second.radius) continue

                const hueDifference = this.hueDiff(first.hue, second.hue)
                const mergeThreshold = Math.min(first.mergeHueDiff, second.mergeHueDiff)
                if (hueDifference < mergeThreshold && this.points.length - removed.size > 3) {
                    this.merge(first, second)
                    removed.add(second)
                } else {
                    this.blendAndSeparate(first, second, dx, dy, distance)
                }
            }
        }
        return removed
    }

    blendAndSeparate(first, second, dx, dy, distance) {
        const blended = this.mixHue(first.hue, second.hue)
        first.hue = (first.hue * .7 + blended * .3) % 360
        second.hue = (second.hue * .7 + blended * .3) % 360
        first.cool = 22
        second.cool = 22
        const nx = dx / (distance || 1)
        const ny = dy / (distance || 1)
        first.vx -= nx * .7 * first.speedScale
        first.vy -= ny * .7 * first.speedScale
        second.vx += nx * .7 * second.speedScale
        second.vy += ny * .7 * second.speedScale
    }

    spawnOffspring(removed) {
        const newborns = []
        let population = this.points.length - removed.size
        for (const chromite of this.points) {
            if (removed.has(chromite) || chromite.mass < chromite.burstMinMass ||
                chromite.hunger < chromite.burstHunger || chromite.energy < chromite.burstMinEnergy) continue
            const offspring = this.burst(chromite, population)
            if (!offspring.length) continue
            removed.add(chromite)
            newborns.push(...offspring)
            population += offspring.length - 1
        }
        return newborns
    }

    recycleExpired(removed) {
        for (const chromite of this.points) {
            if (removed.has(chromite)) continue
            const lifespanFactor = chromite.mass < .8 ? 1.20 : 1
            if (chromite.age > chromite.lifespan * lifespanFactor) {
                chromite.energy -= .035 * chromite.genes.metabolism
            }
            if (chromite.energy <= 0 && chromite.age > 900) {
                this.popShockwave(chromite, .65)
                removed.add(chromite)
                this.recycle(chromite)
            }
        }
    }

    replacePopulation(removed, newborns) {
        if (!removed.size && !newborns.length) return
        this.dragging?.removePoints(...removed)
        const survivors = Array.from(this.points).filter(chromite => !removed.has(chromite))
        this.points = new PointList(...survivors, ...newborns)
        this.dragging?.add(...newborns)
    }

    render(ctx) {
        ctx.save()
        this.renderRipples(ctx)
        this.renderFood(ctx)
        ctx.restore()
        for (const chromite of this.points) chromite.render(ctx)
    }

    renderRipples(ctx) {
        for (const ring of this.ripples) {
            const alpha = ring.life / ring.maxLife
            ctx.beginPath()
            ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(140,185,220,${.3 * alpha})`
            ctx.lineWidth = 1.5 * alpha
            ctx.stroke()
            ring.r += 2.6
            ring.life--
        }
        this.ripples = this.ripples.filter(ring => ring.life > 0)
    }

    renderFood(ctx) {
        for (const food of this.nutrients) {
            const radius = Math.max(1.2, Math.min(3, 2 * Math.sqrt(food.mass / .25)))
            const coloredFood = Number.isFinite(food.hue)
            ctx.fillStyle = this.overrideColor ?? (coloredFood ? `hsla(${food.hue} 65% 35% / .85)` : 'rgba(32,40,53,.8)')
            ctx.beginPath()
            ctx.arc(food.x, food.y, radius, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = this.overrideColor ?? (coloredFood ? `hsla(${food.hue} 80% 70% / .65)` : 'rgba(95,107,120,.55)')
            ctx.beginPath()
            ctx.arc(food.x - .35, food.y - .45, .5, 0, Math.PI * 2)
            ctx.fill()
        }
    }
}

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.world = new ChromiteWorld({canvas: this.canvas, dragging: this.dragging})
        this.world.seed()
        addButton('Sprinkle food', {
            onclick: () => this.world.sprinkleFood(
                this.canvas.width * (.2 + Math.random() * .6),
                this.canvas.height * (.2 + Math.random() * .6))
        })
        addButton('Add Chromies (3–6)', {onclick: () => this.world.addChromies()})
    }

    onLongClick(event) {
        const p = Point.from(event)
        this.world.sprinkleFood(p.x, p.y)
    }

    draw(ctx) {
        this.clear(ctx)
        this.world.step()
        this.world.render(ctx)
    }
}

const stage = MainStage.go()
