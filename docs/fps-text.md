title: FPS Text
doc_imports: fps
---

# FPS

Apply the FPS counter to the canvas view

```js
stage.fps.drawFPS(ctx)
```

Like this:

```js
class MainStage extends Stage {
    canvas='playspace'

    draw(ctx){
        this.clear(ctx)
        this.fps.drawFPS(ctx)
    }
}


;stage = MainStage.go();
```