/*
Download the image or other bits, within the theatre
*/

class DownloadApp extends Mountable {
    storageName = 'downloadApp'
    mounted(){

    }

    downloadLinkClick(e) {
        console.log('Link click')
        let filename = this.getFilename()
        if(!stage?.screenshot?.downloadImage) {
            console.log('Installing screenshot')
            Polypoint.head.load('../point_src/screenshot.js', ()=>{
                stage.screenshot.downloadImage(filename)
            })
        } else {
            stage.screenshot.downloadImage(filename)
        }
    }

    getFilename() {
        let filename =  this.$refs.filename.value ?? "my-filename.png"
        return filename;
    }

    downloadCroppedLinkClick(e) {

        let filename = this.getFilename()
        let bgColor = this.$refs.bg_check.checked? '#080808': undefined;
        /// {"x":230,"y":100,"width":300,"height":500,"top":100,"right":511,"bottom":846.09375,"left":230}
        let customCropDimentions = undefined;
        if(!window?.detectEdges) {
            console.log('Installing screenshot')
            let files = [
                "../point_src/screenshot.js",
                "../point_src/image-edge-detection.js",
                "../point_src/offscreen.js",
            ]

            Polypoint.head.load(files, ()=>{
                stage.screenshot.downloadCroppedImage(filename, bgColor, 10, customCropDimentions)
            })
        } else {
            stage.screenshot.downloadCroppedImage(filename, bgColor, 10, customCropDimentions)
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

