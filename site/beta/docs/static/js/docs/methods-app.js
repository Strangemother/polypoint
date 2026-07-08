/* An app to support the method list. */


// let app = Object.assign(appShared.widgetsApp, {
//     widgets: PetiteVue.reactive(v)
// });

let methodsApp = PetiteVue.createApp({
    sorting: 'name'
    // unit: Point  // find through loadDocInfo()
    , ascending: true
    , getUnitMethods(){
        let d = this.cachedUnitMethods()
        return d.instance//.slice().sort()
    }
    , getUnit() {
        /* Look for the public function */
        if(this.unit !== undefined){
            return this.unit
        }

        if(window.loadDocInfo) {
            this.unit = window.loadDocInfo()
            return this.unit
        }

        console.warn('No "unit" found. apply `methodsApp.unit=MyClass`')
    }
    , cachedUnitMethods(){
        if(this._cachedInstance) {
            return this._cachedInstance
        }

        let unit = this.getUnit()
        if(unit == undefined) {
            console.warn('Not unit. No Cache')
            return {
                instance: undefined
                , proto: undefined
            }
        }
        this._cachedInstance = {
            instance: getAllProperties(new unit, 1)
            , proto: getAllProperties(unit)
        }

        // Reorg for display.

        return this._cachedInstance
    }
}).mount('#methods')

