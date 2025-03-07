title: The Theatre!
---

# The Theatre!

Polypoint sometimes refers to a "theatre" file. **It's just JS** - and defines the _primary_ file for your code. It's not special.

## Example

To get started create a file in the `theatre/` directory. When served through the Polypoint renderer, the meta-data at the top of the file serves assets and page data.

```js
/*
title: Example
files:
    head
    pointlist
    point
    stage
    mouse
    dragging
    fps
---

This is an example file with a title, imports, and the stage.
*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 20, rotation: 45})
        this.dragging.add(this.point)
    }

    draw(ctx){
        this.clear(ctx)
        // this.point.pen.indicator(ctx)
        this.fps.drawFPS(ctx)
        // console.log('draw')

    }
}

stage = MainStage.go(/*{ loop: true }*/)
```

That's it! Give it a go within the editor.