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


let tocApp = PetiteVue.createApp({
    unit: Point
    , sorting: 'name'
    , ascending: true
    , getTitles(){
        let d = this.cachedTitles()
        return d
    }

    , cachedTitles(){
        if(this._cachedInstance) {
            return this._cachedInstance
        }

        this._cachedInstance = this.readView()

        // Reorg for display.

        return this._cachedInstance
    }

    , readView(elements='h1,h2,h3,h4') {
        let $els = document
                        /* focus area */
                        .querySelector('.content-stack .outer-block')
                        /* elements to read */
                        .querySelectorAll(elements)
                        ;
        // A flat list
        res = []
        $els.forEach((e)=>{
            let d = {
                tagName: e.tagName,
                textContent: e.textContent,
                key: e
            }
            res.push(d)
        })
        return res
    }
}).mount('#toc-container')
