/*
Demo: Manual-Only Mode (No Auto-Wrapping)

Shows how to use StageHooks without modifying the original methods.
Perfect for research, testing, and custom control flow.
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
    console.log('=== Mode 1: Manual-Only (autoWrap: false) ===\n')
    
    const stage1 = new SimpleStage()
    const hooks1 = new StageHooks(stage1, { autoWrap: false })  // ✅ Won't modify draw()
    
    // Add hooks
    hooks1.draw.before(() => console.log('  Before hook'))
    hooks1.draw.after((result) => console.log('  After hook, result:', result))
    
    console.log('--- Calling stage.draw() directly (no hooks run) ---')
    stage1.draw()
    
    console.log('\n--- Manually running hooks ---')
    const original = hooks1.draw.getOriginal()
    hooks1.draw.runBefore(stage1, [])
    const result = original.call(stage1)
    hooks1.draw.runAfter(stage1, result, [])
    
    console.log('\n--- Using .run() for full lifecycle ---')
    hooks1.draw.run(stage1, original, [])
    
    
    console.log('\n\n=== Mode 2: Auto-Wrap (default) ===\n')
    
    const stage2 = new SimpleStage()
    const hooks2 = new StageHooks(stage2)  // autoWrap: true (default)
    
    hooks2.draw.before(() => console.log('  Before hook'))
    hooks2.draw.after(() => console.log('  After hook'))
    
    console.log('--- Calling stage.draw() - hooks run automatically ---')
    stage2.draw()
    
    
    console.log('\n\n=== Mode 3: Toggle Auto-Wrap ===\n')
    
    const stage3 = new SimpleStage()
    const hooks3 = new StageHooks(stage3, { autoWrap: false })
    
    hooks3.draw.before(() => console.log('  Hook'))
    
    console.log('--- Auto-wrap disabled ---')
    stage3.draw()  // No hooks
    
    console.log('\n--- Enabling auto-wrap ---')
    hooks3.enableAutoWrap('draw')
    stage3.draw()  // Hooks run!
    
    console.log('\n--- Disabling auto-wrap ---')
    hooks3.disableAutoWrap('draw')
    stage3.draw()  // No hooks again
    
    
    console.log('\n\n=== Mode 4: Mixed Usage ===\n')
    
    const stage4 = new SimpleStage()
    const hooks4 = new StageHooks(stage4, { autoWrap: false })
    
    hooks4.draw.before(() => console.log('  Setup'))
    hooks4.draw.after(() => console.log('  Cleanup'))
    
    // Sometimes manual
    console.log('Manual execution:')
    const orig = hooks4.draw.getOriginal()
    hooks4.draw.run(stage4, orig, [])
    
    // Enable auto-wrap for convenience
    hooks4.enableAutoWrap('draw')
    
    console.log('\nAuto execution:')
    stage4.draw()
    
    
    console.log('\n\n=== Mode 5: Research Pattern ===\n')
    
    const stage5 = new SimpleStage()
    const hooks5 = new StageHooks(stage5, { autoWrap: false })
    
    // Add experimental hooks
    let beforeCount = 0
    let afterCount = 0
    
    hooks5.draw.before(() => beforeCount++)
    hooks5.draw.after(() => afterCount++)
    
    const original5 = hooks5.draw.getOriginal()
    
    console.log('Running 1000 iterations...')
    
    console.time('With hooks')
    for (let i = 0; i < 1000; i++) {
        hooks5.draw.run(stage5, original5, [])
    }
    console.timeEnd('With hooks')
    
    console.time('Without hooks (direct)')
    for (let i = 0; i < 1000; i++) {
        original5.call(stage5)
    }
    console.timeEnd('Without hooks (direct)')
    
    console.log(`Before hooks executed: ${beforeCount} times`)
    console.log(`After hooks executed: ${afterCount} times`)
    
    
    console.log('\n\n=== Mode 6: Preserve Original Functionality ===\n')
    
    const stage6 = new SimpleStage()
    
    // Store reference to original draw
    const originalDraw = stage6.draw
    
    // Create hooks without auto-wrap
    const hooks6 = new StageHooks(stage6, { autoWrap: false })
    hooks6.draw.before(() => console.log('  Hook'))
    
    console.log('Original method still works:')
    stage6.draw()  // ✅ Unchanged!
    
    console.log('\nOriginal reference still works:')
    originalDraw.call(stage6)  // ✅ Still works!
    
    console.log('\nHooks available when you want them:')
    hooks6.draw.run(stage6, hooks6.draw.getOriginal(), [])
    
    
    console.log('\n\n=== Comparison Summary ===')
    console.log(`
    autoWrap: true (default)
      ✅ Convenient - hooks run automatically
      ✅ Less code - just call stage.draw()
      ⚠️  Modifies original method
      ⚠️  Less control over execution
      
    autoWrap: false
      ✅ Safe - original method unchanged
      ✅ Full control - you decide when hooks run
      ✅ Research-friendly - easy to compare with/without
      ⚠️  More verbose - manual execution needed
    `)
    
} else {
    console.log('Load stage-hooks.js first!')
}
