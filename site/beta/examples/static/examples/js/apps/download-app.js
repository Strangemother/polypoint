/*
Download the image or other bits, within the theatre
*/

class DownloadApp extends Mountable {
    storageName = 'downloadApp'
    mounted(){

    }

    downloadLinkClick(e) {
        console.log('Link click')
        let filename =  "my-filename.jpg"
        if(!stage?.screenshot?.downloadImage) {
            console.log('Installing screenshot')
            Polypoint.head.load('../point_src/screenshot.js', ()=>{
                stage.screenshot.downloadImage(filename)
            })
        } else {
            stage.screenshot.downloadImage(filename)
        }
    }

    initData(){
        return { width: 10}
    }

    record(dimensions){
        this.store.width = ~~dimensions.width
        this.store.height = ~~dimensions.height
    }
}

const downloadApp = DownloadApp.loadMount('#download_image_app')

