/*
Download the image or other bits, within the theatre
*/

class UploadApp extends Mountable {
    storageName = 'uploadApp'
    mounted(){

    }

    getFilename() {
        let filename =  this.$refs.filename.value ?? "my-filename.png"
        return filename;
    }


    initData(){
        return { width: 10}
    }

    record(dimensions){
        this.store.width = ~~dimensions.width
        this.store.height = ~~dimensions.height
    }
}

const uploadApp = UploadApp.loadMount('#upload_image_app')

