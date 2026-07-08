/* This app has a unique loading sequence, in order capture early install events
Whilst allowing defered loading.

checkout `early-installs-logger-app.js`
*/

console.log('SceneToolsApp')

class SceneToolsApp extends Mountable {
    storageName = 'sceneToolsApp'

    initData(){
        return {
            'paused': false
        }
    }

    mounted(){
        setTimeout(()=>{
            this.store.paused = !stage._loopDraw
        }, 300)
    }

    buttonPause(e){
        console.log('buttonPause')
        stage.freeze()
        this.store.paused = true
    }

    buttonPlay(e){
        console.log('buttonPlay')
        stage.unfreeze()
        this.store.paused = false
    }

    buttonStep(e){
        console.log('buttonStep')
        stage.update()
    }
}

const sceneToolsApp = SceneToolsApp.loadMount('#stage_tools_app')


