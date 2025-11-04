

// let ret = document.querySelector('.playspace-container').getBoundingClientRect();
// let retC = document.querySelector('#playspace')

// retC.width = ret.width
// retC.height = ret.height

let earlyEvents = [];

try{
    const sceneGo = function(event) {
        console.log('Global scene:go event caught:', event);
        if (sceneSelectorApp
            && sceneSelectorApp.isMounted == true) {
            console.log('sceneSelectorApp is mounted, handling event immediately.');
            sceneSelectorApp.handleSceneGoEvent(event);
        } else {
            console.log('sceneSelectorApp not mounted yet, queuing event.');
            earlyEvents.push(event);
        }
    }
    events.on('scene:go', sceneGo);
} catch {
    console.warn('No events')
}

class SceneSelectorApp extends Mountable {
    storageName = 'sceneSelectorApp'

    mounted(){
        console.log('sceneSelectorApp Mounted')
        // Process any early events that were queued before mounting
        if (earlyEvents.length > 0) {
            // earlyEvents.forEach(event => this.handleSceneGoEvent(event));
            earlyEvents = []; // Clear the queue
        }
        this.isMounted = true;
    }

    initData(){
        return { scenes:[], isMounted: false }
    }

    handleSceneGoEvent(event) {
        console.log('Handling scene go event:', event);
        // Add your scene handling logic here
        let name = event.detail.name
        let stage = event.detail.stage

        if (!name) {
            name = stage.constructor.name
        }

        // this.store.scenes.push({
        //     stage
        //     , name
        //  });

        this.store.scenes.push(name);
    }
}

const sceneSelectorApp = SceneSelectorApp.loadMount('#scene_selector_app')

