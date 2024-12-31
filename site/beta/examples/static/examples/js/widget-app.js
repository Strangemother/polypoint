

const createWidgetsApp = function() {
    /*
        Point widgets.
     */
    const setup = function(d) {
        if(d.id == undefined) {
            d.id = Math.random().toString(32).slice(2)
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

    let app = Object.assign(appShared.widgetsApp, {

        widgets: [
            setup({
                /*id: 'apples'
                ,*/ fields: {
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
            })
            , setup({ fields: { x: 0, y: 0, rotation: 0 } })
        ]
    });

    return PetiteVue.createApp(app).mount('#widgets')
}