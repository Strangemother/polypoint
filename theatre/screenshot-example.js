/*
title: Screenshot
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    // ../point_src/capture/encoder.js
    ../point_src/screenshot.js
---

Download a screenshot of the stage using `stage.screenshot` methods.

    this.screenshot.downloadImage("my-filename.jpg")

 */

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.pointA = new Point(200, 300, 10, 20)
        this.pointB = new Point(230, 330, 10, 20)
        let _this = this

        addButton('download', {
            label: 'Download Image'
            , onclick(ev){
                _this.screenshot.downloadImage("my-filename.jpg")
            }
        })
    }

    manualExample(){
        _this.screenshot.toBlobURL(function(url){
            const anchor = document.createElement('a');
            anchor.download = 'my-filename.jpg'; // optional, but you can give the file a name
            anchor.href = url // URL.createObjectURL(blob);
            anchor.click(); // ✨ magic!
            // URL.revokeObjectURL(anchor.href); // remove it from memory and save on memory! 😎
            setTimeout(()=> URL.revokeObjectURL(anchor.href), 1000)
        })

    }

    draw(ctx){
        this.clear(ctx)
        this.pointA.pen.indicator(ctx, { color: 'red'})
    }

}


;stage = MainStage.go()