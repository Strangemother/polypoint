/*
---
title: Widget: Mouse Indicator
tags: widget
files:
    head
    point
    mouse
    stage
    fps
    ../point_src/smooth-number.js
---

A "widget" presents the values in a small `div` indicator, connected to the
widget through a standard (Vue) reactive integration:

Add a widget:

    addWidget('example', {
        fields: {
            x: { value: 0 }
            , y: { value: 0 }
        }
    })

Update the widget with values:

    updateWidgetValues('diff', {
        x: 10
        , y: -20
    })


Raw example of updating the values within the widget:

    appShared.widgetsApp.widgets.example.fields.x = 100

Therefore to create a basic mouse widget:

    let widgetFields = appShared.widgetsApp.widgets.example.fields

    let pos = this.mouse.position
    widgetFields.x.value = ~~pos.x
    widgetFields.y.value = ~~pos.y

This is identical to the `updateWidgetValues` call

 */
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        console.log('in')

        addWidget('mouse', {
            showTitle: true
            , fields: {
                x: { value: 0/*, postfix: 'px' */}
                , y: { value: 0/*, postfix: 'px' */}
                , speed: { value: 0/*, postfix: 'px' */}
            }
        })

        this.mouse.zIndex = 'bound'
        this.speedNumber = new SmoothNumber()
        this.speedNumber.modulusRate = 5
        setTimeout(this.resize.bind(this), 20)
    }

    step() {
        let mouse = this.mouse
        let pos = mouse.position
        this.speedNumber.push(mouse.speed())
        updateWidgetValues('mouse',{
                'x': ~~pos.x
                , 'y': ~~pos.y

                , 'speed': Math.sqrt(this.speedNumber).toFixed(0)
                // , 'speed': Math.sqrt(mouse.modulatedSpeed()).toFixed(0)
                // , 'speed': mouse.speed()
            })
    }

    stepRaw() {
        let widget = getWidget('mouse')
        // let widget = appShared.widgetsApp?.widgets?.mouse.fields
        if(!widget){ return }
        let widgetFields = widget.fields
        let pos = this.mouse.position
        widgetFields.x.value = ~~pos.x
        widgetFields.y.value = ~~pos.y
    }

    step2() {
        let pos = this.mouse.position
        updateWidgetValue('mouse', 'x', ~~pos.x)
        updateWidgetValue('mouse', 'y', ~~pos.y)
    }


    draw(ctx){
        this.step()
        this.clear(ctx)
        this.fps.drawFPS(ctx)
        this.center.pen.indicator(ctx, { color: 'gray', width: 1})
        this.mouse.point.pen.indicator(ctx, { color: 'gray', width: 1})
        // this.mouse.position.pen.indicator(ctx, { color: 'gray', width: 1})
    }
}

stage = MainStage.go()
