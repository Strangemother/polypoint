/*
Demo: How StageHooks Work

This demonstrates how hooks are automatically executed when you call methods.
*/

// Simplified example to show the concept
class SimpleStage {
    constructor() {
        this.frameCount = 0
    }
    
    draw() {
        console.log(`  → Drawing frame ${this.frameCount}`)
        this.frameCount++
        return this.frameCount
    }
    
    clear() {
        console.log('  → Clearing canvas')
    }
}

// If StageHooks is available (after loading stage-hooks.js)
if (typeof StageHooks !== 'undefined') {
    const stage = new SimpleStage()
    const hooks = new StageHooks(stage)
    
    console.log('=== Example 1: Before and After Hooks ===')
    
    // Add hooks
    hooks.draw.before(() => {
        console.log('BEFORE: Preparing to draw...')
    })
    
    hooks.draw.after((result) => {
        console.log('AFTER: Draw complete! Frame:', result)
    })
    
    // Now just call the method - hooks run automatically!
    stage.draw()
    stage.draw()
    
    console.log('\n=== Example 2: Multiple Hooks ===')
    
    hooks.draw.before(() => {
        console.log('BEFORE #2: Saving context')
    })
    
    hooks.draw.after(() => {
        console.log('AFTER #2: Restoring context')
    })
    
    stage.draw()
    
    console.log('\n=== Example 3: Around Hook (Wrapping) ===')
    
    const stage2 = new SimpleStage()
    const hooks2 = new StageHooks(stage2)
    
    hooks2.draw.around(function(original, args) {
        console.log('AROUND: Before original')
        const result = original.apply(this, args)
        console.log('AROUND: After original')
        return result
    })
    
    stage2.draw()
    
    console.log('\n=== Example 4: Chaining ===')
    
    const stage3 = new SimpleStage()
    const hooks3 = new StageHooks(stage3)
    
    hooks3.draw
        .before(() => console.log('1. Setup'))
        .before(() => console.log('2. Validate'))
        .after(() => console.log('3. Cleanup'))
        .after(() => console.log('4. Log'))
    
    stage3.draw()
    
    console.log('\n=== Example 5: Hook Management ===')
    
    const stage4 = new SimpleStage()
    const hooks4 = new StageHooks(stage4)
    
    const myHook = () => console.log('My special hook')
    
    hooks4.draw.before(myHook)
    hooks4.draw.before(() => console.log('Another hook'))
    
    console.log('With hooks:')
    stage4.draw()
    
    console.log('\nRemoving specific hook...')
    hooks4.draw.remove('before', myHook)
    stage4.draw()
    
    console.log('\nClearing all hooks...')
    hooks4.draw.clear()
    stage4.draw()
    
    console.log('\n=== Example 6: Inspection ===')
    
    const stage5 = new SimpleStage()
    const hooks5 = new StageHooks(stage5)
    
    hooks5.draw.before(() => {})
    hooks5.draw.before(() => {})
    hooks5.draw.after(() => {})
    
    console.log('Hook list:', hooks5.draw.list())
    console.log('Hook count:', hooks5.draw.count())
    console.log('All stats:', hooks5.getStats())
    
    console.log('\n=== Example 7: Auto-Discovery ===')
    
    const stage6 = new SimpleStage()
    const hooks6 = new StageHooks(stage6)
    
    // ANY method is automatically hookable!
    hooks6.clear.before(() => console.log('Before clear'))
    hooks6.clear.after(() => console.log('After clear'))
    
    stage6.clear()
    
    console.log('\n=== Example 8: Access to "this" ===')
    
    const stage7 = new SimpleStage()
    const hooks7 = new StageHooks(stage7)
    
    hooks7.draw.before(function() {
        console.log('Frame count inside hook:', this.frameCount)
    })
    
    hooks7.draw.after(function(result) {
        console.log('Frame count after draw:', this.frameCount)
    })
    
    stage7.draw()
    
} else {
    console.log('Load stage-hooks.js first!')
}


// ============================================
// Example with Polypoint Stage (if available)
// ============================================

if (typeof Polypoint !== 'undefined' && Polypoint.Stage) {
    console.log('\n\n=== Polypoint Stage Example ===')
    
    const stage = new Polypoint.Stage()
    
    // Hooks are automatically available via deferred property
    stage.hooks.draw.before(function() {
        console.log('Before Stage.draw - time:', performance.now())
        this.ctx.save()
    })
    
    stage.hooks.draw.after(function() {
        console.log('After Stage.draw - time:', performance.now())
        this.ctx.restore()
    })
    
    // Add performance monitoring
    stage.hooks.draw.before(function() {
        this._drawStartTime = performance.now()
    })
    
    stage.hooks.draw.after(function() {
        const duration = performance.now() - this._drawStartTime
        console.log(`Draw took ${duration.toFixed(2)}ms`)
    })
    
    // Now when you draw, all hooks run automatically
    stage.draw()
}
