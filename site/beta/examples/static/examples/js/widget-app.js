

const addWidget = function(name, definition)  {
    /*addUI('save', {
        label: "Save JSON"
        , onclick(ev) {
            console.log('Save')
        }
    })*/
    let prep = appShared.miniApp.prepared
    console.log('Emit widget', prep)
    if(prep != true) {
        console.log('Storing for later')
        appShared.widgetsApp[name] = definition
    }

    emitEvent('polypoint:widget:add', { name, definition })
}

const getWidget = function(name) {
    let w = appShared.widgetsApp.widgets
    if(w) {
        return w[name]
    }
}

const updateWidgetValue = function(id, key, value){
    // ('mouse', 'x', ~~pos.x)
    // updateWidgetValue('mouse', 'x', ~~pos.x)
    let widget = getWidget(id)
    if(!widget){ return };
    let widgetFields = widget.fields
    widgetFields[key].value = value
}

const updateWidgetValues = function(id, data){
    let widget = getWidget(id)
    if(!widget){ return };
    let widgetFields = widget.fields
    for(let k in data) {
        let v = data[k]
        widgetFields[k].value = v
    }
}

const addExampleWidget = function(){
    const d = {
        /*id: 'apples'
        ,*/
        fields: {
            x: {
                value: 100
                // , postfix: "px"
            }
            , y: {
                value: 200
                // , postfix: "px"
            }
            , radius: {
                value: 50
                // , postfix: "px"
                /*N-ary Circled Dot Operator*/
                , label: '&#10752;'
            }
            , rotation: {
                value: 33.3
                // https://www.alt-codes.net/angle-symbols
                , label: "&#8736;"
                // , postfix: "&deg;"
            }
        }
    }

    addWidget('demo', d)
}

const createWidgetsApp = function() {
    /*
        Point widgets.
     */

    onEvent('polypoint:widget:destroy', (ev)=>{
        let data = ev.detail
        let name = data.name
        console.log('destroy widget', name)
        let def = app.widgets[name]
        if(def == undefined) {
            console.warn('No widget named', name)
            return
        }

        console.log('before', Object.keys(app.widgets))

        delete app.widgets[name]
        console.log('after', Object.keys(app.widgets))
        // app.items.push('Another')
    })

    onEvent('polypoint:widget:add', (ev)=>{
        let data = ev.detail
        let { name, definition } = data

        if(app.widgets[name] != undefined) {
            console.warn('Will not apply again:', name)
            return
        }

            // , setup({ fields: { x: 0, y: 0, rotation: 0 } })
        app.widgets.push(setup(definition, name))
        // app.widgets[name] = setup(definition, name)
    })

    const setup = function(d, name) {
        if(d.id == undefined) {
            d.id = Math.random().toString(32).slice(2)
        }

        if(d.title == undefined) {
            d.title = name
        }

        for(let k in d.fields) {
            let v = d.fields[k];
            if(typeof(v) != 'object') {
                v = d.fields[k] = {
                    label: k
                    , value: v
                }
            }

            if(v.label == undefined) {
                d.fields[k].label = k
            }

            if(v.value == undefined) {
                d.fields[k].value = v
            }
        }
        return d
    }

    // second: setup({ fields: { x: 0, y: 0, rotation: 0 } })
    let v = {};

    for(let k in appShared.widgetsApp) {
        let definition = appShared.widgetsApp[k]
        v[k] = setup(definition, k)
    }

    let app = Object.assign(appShared.widgetsApp, {
        widgets: PetiteVue.reactive(v)
    });

    return PetiteVue.createApp(app).mount('#widgets')
}