# Scene

Currently a Stage handles all primary drawing in the context.

A scene should wrap all the content expected to draw, enabling the user to _switch_ scenes using a simple command.

    Stage {

        draw(ctx) {
            this.scene.draw(ctx)
        }
    }

The scene can handle a similar range of events,

+ created: once
+ firstDraw: Once
+ onEntry: Every _switch_ to.
+ onExit: Every switch away
+ destroy: optional - timed for animations.

Switch functionality allows cross fading, lerping, and sharing points across scenes:

    stage.scenes.select(1)

    stage.scenes.switch(2)
    stage.scenes.switch() // optional next.
    stage.scenes.switch('named scene')

