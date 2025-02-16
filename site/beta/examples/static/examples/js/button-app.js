
const destroyButton = function(name)  {
    emitEvent('polypoint:control:destroy', { name })
}


const addButton = function(name, definition)  {
    /*addButton('save', {
        label: "Save JSON"
        , onclick(ev) {
            console.log('Save')
        }
    })*/
    if(definition.field == undefined) {
        definition.field = 'button'
    }

    return addControl(name, definition)
}


const addControl = function(name, definition)  {
    /*addUI('save', {
        label: "Save JSON"
        , onclick(ev) {
            console.log('Save')
        }
    })*/
    let prep = appShared.miniApp.prepared
    console.log('Emit info', prep)
    if(prep != true) {
        appShared.earlyButtons[name] = definition
    }

    emitEvent('polypoint:control:add', { name, definition })
}


const addExampleButton = function()  {
    let example = {
        /* An example clicky button */
        label: 'cheese'
        , onclick(ev, proxiedSelf) {
            console.log('new example Clicked', ev, proxiedSelf)
            emitEvent('example')
        }
    }

    emitEvent('polypoint:control:add', { name: 'newExample', definition: example })
}


const createMiniApp = function() {
    /*
        Buttons
    */
    onEvent('polypoint:control:destroy', (ev)=>{
        let data = ev.detail
        let name = data.name
        console.log('destroy button', name)
        let def = app.controls[name]
        if(def == undefined) {
            console.warn('No button named', name)
            return
        }

        console.log('before', Object.keys(app.controls))

        delete app.controls[name]
        console.log('after', Object.keys(app.controls))
        // app.items.push('Another')
    })

    onEvent('polypoint:control:add', (ev)=>{
        let data = ev.detail
        let { name, definition } = data

        if(app.controls[name] != undefined) {
            console.warn('Will not apply again:', name)
            return
        }

        app.controls[name] = setupDefinition(name, definition)
    })

    const setupControls = function(b){
        let r = {}
        for(let k in b) {
            let v = b[k]
            // v.key = k
            let newV = setupDefinition(k, v)
            r[k] = newV
        }
        return r
    }

    const setupDefinition = function(key, definition, additionalData={}) {
        let res = Object.assign(additionalData, {key, label: key}, definition)
        return res
    }

    // example: {
    //     /* An example clicky button */
    //     label: 'banana'
    //     , onclick(ev, proxiedSelf) {
    //         console.log('Clicked', ev, proxiedSelf)
    //         emitEvent('example')
    //     }
    // }
    let controls = setupControls(Object.assign({}, appShared.earlyButtons, ))

    let app = Object.assign(appShared.miniApp, {
        prepared: true
        , controls: PetiteVue.reactive(controls)
        , clickHandler: (ev, unit) => {
            /* Called through onclick the UI node

                <a @click=clickHandler(ev, item)>banana</a>
            */
            if(unit.onclick) {
                unit.onclick(ev, unit)
            }

            emitEvent('polypoint:control:click', unit)
        }

        , changeHandler: (ev, unit) => {
            /* Called through onchange the UI node

                <a @change=changeHandler(ev, item)>banana</a>
            */
            if(unit.onchange) {
                unit.onchange(ev, unit)
            }
            emitEvent('polypoint:control:change', unit)
        }
    });

    return PetiteVue.createApp(app).mount('#mini-app')
}
