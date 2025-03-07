/* This app has a unique loading sequence, in order capture early install events
Whilst allowing defered loading
*/

class InstallsLoggerApp extends Mountable {
    storageName = 'installsLoggerApp'
    mounted(){
        this.installCache = installCache
        this.drain(installCache)
        this.writeText('Mounted', this.installCache.cache.length, 'files')
    }

    drain(installCache) {
        /* Given the initial install object, drain and process early data. */
        let lines = []
        installCache.cache.forEach((e, i, a)=>{
            let r = e.name
            lines.push(`<li><span>${i+1}</span> <span>${r}</span></li>`)
        })

        this.$refs.textSlot.innerHTML = lines.join('')
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


