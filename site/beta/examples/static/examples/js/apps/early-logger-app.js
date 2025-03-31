/* This app has a unique loading sequence, in order capture early install events
Whilst allowing defered loading.

This _early_ script captures events and stashes them for the installs app.
*/


const logger = {
    create(name) {
        return this.logFunc
    }

    , logFunc(){
        //console.log('Logger', arguments)
    }
}

const loggerCache = {
    eventCache: []
    , receivers: {
        initCacher(entity) {
            this.eventCache.push(entity)
        }
    }
    , log: logger.create('generic')
}

addEventListener('Polypoint:install', (e)=>{
    let entity = e.detail.entity
    loggerCache.log('catch install', entity.name)
    // let eventReceivers = loggerCache.receivers
    // for(let k in eventReceivers) {
    //     eventReceivers[k].call(loggerCache, entity)
    // }
});

addEventListener('Polypoint:install:lazyProp', (e)=>{
    let entity = e.detail.entity
    loggerCache.log('catch lazy install', entity)
    // let installReceivers = loggerCache.receivers
    // for(let k in installReceivers) {
    //     installReceivers[k].call(loggerCache, entity)
    // }
});
