/*
Capture logging events from the polypoint library and present them as a
list of readable items.

Hopefully tabs. Each item is a string,
*/

class Logging extends Mountable {
    storageName = 'loggerApp'
    mounted(){
        this.loggerCache = loggerCache
        this.drain(loggerCache)
        this.writeText('Mounted', this.loggerCache.eventCache.length, 'files')
    }

    drain(loggerCache) {
        /* Given the initial install object, drain and process early data. */
        let lines = []
        loggerCache.eventCache.forEach((e, i, a)=>{
            let r = e.name
            lines.push(`<li><span>${i+1}</span> <span>${r}</span></li>`)
        })

        this.$refs.debugger_lines.innerHTML = lines.join('')
    }

    writeText(text){
        /* Use raw text writes, rather than the binding - for speed.*/
        this.$refs.liveText.innerText = Array.from(arguments).join(' ')
    }

    initData(){
        return { words: 'No Text'}
    }
}

const loggerApp = Logging.loadMount('#logging_app')


