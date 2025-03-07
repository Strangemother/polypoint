/* This app has a unique loading sequence, in order capture early install events
Whilst allowing defered loading.

This _early_ script captures events and stashes them for the installs app.
*/


const installCache = {
    cache: []
    , receivers: {
        initCacher(entity) {
            this.cache.push(entity)
        }
    }
}

addEventListener('Polypoint:install', (e)=>{
    let entity = e.detail.entity
    // console.log('catch install', entity.name)
    let installReceivers = installCache.receivers
    for(let k in installReceivers) {
        installReceivers[k].call(installCache, entity)
    }
});
