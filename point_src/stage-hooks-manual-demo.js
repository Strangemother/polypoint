/*
Demo: Manual Hook Execution

This demonstrates how to manually invoke hook stacks for research and custom control.
*/

class SimpleStage {
    constructor() {
        this.frameCount = 0
    }
    
    draw() {
        console.log(`  → Drawing frame ${this.frameCount}`)
        this.frameCount++
        return this.frameCount
    }
}

if (typeof StageHooks !== 'undefined') {
    console.log('=== Manual Hook Execution Demo ===\n')
    
    const stage = new SimpleStage()
    const hooks = new StageHooks(stage)
    
    // Add some hooks
    hooks.draw.before(() => {
        console.log('  Before hook #1')
    })
    
    hooks.draw.before(() => {
        console.log('  Before hook #2')
    })
    
    hooks.draw.after((result) => {
        console.log('  After hook #1, result:', result)
    })
    
    hooks.draw.after(() => {
        console.log('  After hook #2')
    })
    
    console.log('--- Example 1: Run only BEFORE hooks ---')
    hooks.draw.runBefore(stage, [])
    
    console.log('\n--- Example 2: Run only AFTER hooks ---')
    hooks.draw.runAfter(stage, 'custom result', [])
    
    console.log('\n--- Example 3: Run BEFORE, then function, then AFTER manually ---')
    hooks.draw.runBefore(stage, [])
    const result = stage.draw()
    hooks.draw.runAfter(stage, result, [])
    
    console.log('\n--- Example 4: Run full lifecycle manually ---')
    const fullResult = hooks.draw.run(stage, stage.draw, [])
    console.log('Full result:', fullResult)
    
    console.log('\n--- Example 5: Run hooks multiple times (for testing) ---')
    hooks.draw.runBefore(stage, [])
    hooks.draw.runBefore(stage, [])
    hooks.draw.runBefore(stage, [])
    
    console.log('\n--- Example 6: Around hook manually ---')
    const stage2 = new SimpleStage()
    const hooks2 = new StageHooks(stage2)
    
    hooks2.draw.around(function(original, args) {
        console.log('  Around: wrapping start')
        const result = original.apply(this, args)
        console.log('  Around: wrapping end')
        return result
    })
    
    const aroundResult = hooks2.draw.runAround(stage2, stage2.draw.bind(stage2), [])
    console.log('Around result:', aroundResult)
    
    console.log('\n--- Example 7: Custom execution order ---')
    const stage3 = new SimpleStage()
    const hooks3 = new StageHooks(stage3)
    
    hooks3.draw.before(() => console.log('  Setup'))
    hooks3.draw.after(() => console.log('  Cleanup'))
    
    // You control exactly when things run
    console.log('Step 1: Before hooks')
    hooks3.draw.runBefore(stage3, [])
    
    console.log('Step 2: Some custom logic')
    console.log('  → Custom processing...')
    
    console.log('Step 3: Original function')
    const res = stage3.draw()
    
    console.log('Step 4: More custom logic')
    console.log('  → More processing...')
    
    console.log('Step 5: After hooks')
    hooks3.draw.runAfter(stage3, res, [])
    
    console.log('\n--- Example 8: Direct hook array access ---')
    const stage4 = new SimpleStage()
    const hooks4 = new StageHooks(stage4)
    
    hooks4.draw.before(() => console.log('  Hook 1'))
    hooks4.draw.before(() => console.log('  Hook 2'))
    
    // Get direct access to the hooks
    const hookArrays = hooks4.draw.getHooks()
    console.log('Before hooks count:', hookArrays.before.length)
    
    // Manually iterate and call
    console.log('Manually calling each hook:')
    for (const fn of hookArrays.before) {
        fn.call(stage4, [])
    }
    
    console.log('\n--- Example 9: Conditional execution ---')
    const stage5 = new SimpleStage()
    const hooks5 = new StageHooks(stage5)
    
    hooks5.draw.before(() => console.log('  Debug hook'))
    hooks5.draw.after(() => console.log('  Stats hook'))
    
    const DEBUG = true
    
    if (DEBUG) {
        console.log('Debug mode - running before hooks:')
        hooks5.draw.runBefore(stage5, [])
    }
    
    stage5.draw()
    
    if (DEBUG) {
        console.log('Debug mode - running after hooks:')
        hooks5.draw.runAfter(stage5, null, [])
    }
    
    console.log('\n--- Example 10: Benchmark hooks separately ---')
    const stage6 = new SimpleStage()
    const hooks6 = new StageHooks(stage6)
    
    hooks6.draw.before(() => {})
    hooks6.draw.before(() => {})
    hooks6.draw.after(() => {})
    
    console.time('Before hooks')
    for (let i = 0; i < 10000; i++) {
        hooks6.draw.runBefore(stage6, [])
    }
    console.timeEnd('Before hooks')
    
    console.time('Function only')
    for (let i = 0; i < 10000; i++) {
        stage6.draw()
    }
    console.timeEnd('Function only')
    
    console.time('After hooks')
    for (let i = 0; i < 10000; i++) {
        hooks6.draw.runAfter(stage6, null, [])
    }
    console.timeEnd('After hooks')
    
} else {
    console.log('Load stage-hooks.js first!')
}
