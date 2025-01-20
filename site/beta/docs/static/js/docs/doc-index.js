/* An app to support the method list. */


// let app = Object.assign(appShared.widgetsApp, {
//     widgets: PetiteVue.reactive(v)
// });

let app = PetiteVue.createApp({
    unit: Point
    , sorting: 'name'
    , ascending: true
    , getUnitMethods(){
        let d = this.cachedUnitMethods()
        return d.instance//.slice().sort()
    }

    , cachedUnitMethods(){
        if(this._cachedInstance) {
            return this._cachedInstance
        }

        this._cachedInstance = {
            instance: getAllProperties(new this.unit, 1)
            , proto: getAllProperties(this.unit)
        }

        // Reorg for display.

        return this._cachedInstance
    }
}).mount('#methods')

