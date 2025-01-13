/*
---
title: Widget: Mouse Indicator
tags: widget
files:
    ../point_src/math.js
    head
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    point
    mouse
    stage
    dragging
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

Raw example of updating the values within the widget:

    appShared.widgetsApp.widgets.example.fields.x = 100

Therefore to create a basic mouse widget:

    let widgetFields = appShared.widgetsApp.widgets.example.fields

    let pos = this.mouse.position
    widgetFields.x.value = ~~pos.x
    widgetFields.y.value = ~~pos.y

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
            }
        })

        this.mouse.zIndex = 'bound'
        setTimeout(this.resize.bind(this), 20)
    }

    step() {
        let pos = this.mouse.position
        updateWidgetValues('mouse',{
                'x': ~~pos.x,
                'y': ~~pos.y
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
        this.center.pen.indicator(ctx, { color: 'gray', width: 1})
        this.mouse.point.pen.indicator(ctx, { color: 'gray', width: 1})
        // this.mouse.position.pen.indicator(ctx, { color: 'gray', width: 1})
    }
}

stage = MainStage.go()
