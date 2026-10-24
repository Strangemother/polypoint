# Stage lifecycle

Start with a known-good minimal pattern:

```javascript
class MainStage extends Stage {
    canvas = 'playspace';
    mounted() { this.tick = 0; }
    draw(ctx) {
        this.clear(ctx);
        ctx.fillStyle = '#8ad';
        ctx.fillRect(20, 20, 40, 40);
        this.tick++;
    }
}
stage = MainStage.go();
```

The HTML page must have the playspace canvas. `mounted()` initializes state, `draw(ctx)` is called repeatedly. Refer to `theatre/text-simple-example.js` for actual platform conventions. Do not assume `this` inside a nested `function`; use a captured variable or arrow function. For interactive examples attach keyboard listeners once in mounted rather than each frame.
