/* This app has a unique loading sequence, in order capture early install events
Whilst allowing defered loading.

checkout `early-installs-logger-app.js`
*/

class InstallsLoggerApp extends Mountable {
    storageName = 'installsLoggerApp'
    mounted(){

        // Grabbeb from the global, applied by early-installs-logger-app
        this.installCache = installCache
        this.drain(installCache)
        this.writeText('Mounted', this.installCache.classCache.length, 'files')
    }

    drain(installCache) {
        /* Given the initial install object, drain and process early data. */
        let lines = []
        installCache.classCache.forEach((e, i, a)=>{
            let r = e.name || e;
            lines.push(`<li>
                <span>${i+1}</span>
                <span>
                    <a href="/files/file/${r}" target=_blank>${r}</a>
                </span>
            </li>`)
        })

        this.$refs.classesTextSlot.innerHTML = lines.join('')

        let lines2 = []
        installCache.propsCache.forEach((e, i, a)=>{
            let r = e.name || e;
            let innerList = []
            for(let item in e.propsDict) {
                let v = item
                innerList.push(`<li>${v}</li>`)
            };

            lines2.push(`<li>
                <span>${i+1}</span>
                <span>${r}</span>
                <span>
                    <ul class="sub-props">
                        ${innerList.join('')}
                    </ul>
                </span>
            </li>`)
        })

        this.$refs.propsTextSlot.innerHTML = lines2.join('')
    }

    writeText(text){
        /* Use raw text writes, rather than the binding - for speed.*/
        this.$refs.liveText.innerText = Array.from(arguments).join(' ')
    }

    togglePopup(e) {
        /* show/hide the popup live install panel.*/
        let me = this
        let cl = this.$refs.owner.classList
        cl.toggle('show-panel')
        cl.toggle('hide-panel')
    }

    initData(){
        return { words: 'No Text'}
    }
}

const installsLoggerApp = InstallsLoggerApp.loadMount('#installs_logger_app')


