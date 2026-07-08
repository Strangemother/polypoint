/*
Mount an application to an interface node by extending the object


    class EmailContainer extends Mountable {
        storageName = 'emailContainer'
        mounted(){
            console.log('emailContainer Mounted')
        }
    }

    const emailContainer = EmailContainer.loadMount('#view_panel_email_container')

 */

const reactive = PetiteVue.reactive
    , createApp = PetiteVue.createApp

/* Reactive store. */
const globalStore = {}


class Mountable {
    storageName = 'mountable'

    constructor() {
        this.store = globalStore[this.storageName] = reactive(this.initData())
    }

    initData(){
        return { count: 1 }
    }

    static mount(name) {
        let  v = new this()
        v.mountVue(name)
        return v
    }

    static loadMount(name){
        /* Wait for the right load time

            const emailContainer = EmailContainer.loadMount('#view_panel_email_container')
        */
        let  item = new this()
        const onload = ()=> {
            item.mountVue(name)
            return item
        }

        if (document.readyState === "loading") {
              // Loading hasn't finished yet
              document.addEventListener("DOMContentLoaded", onload);
              return item
        }
        // `DOMContentLoaded` has already fired
        return onload();
    }

    mountVue(name) {
        // has directive, mount, unmount
        const emailContainerApp = createApp(this)
        emailContainerApp.mount(name) // returns void
        let m = this.mounted
        m && m.bind(this)()
        return emailContainerApp
    }

    mounted(){
        console.log('Mounted')
    }
}
