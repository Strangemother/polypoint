/*
Upload the image or other bits, within the theatre
*/

class UploadApp extends Mountable {
    storageName = 'uploadApp'

    emitUploadComplete(data) {
        const detail = {
            file: data?.file || '',
            series_index: data?.series_index || '',
            still_image_path: data?.still_image_path || '',
            theatrefile_id: data?.theatrefile_id || null,
            theatre_filename: this.getTheatreFilename(),
        }

        if (typeof emitEvent === 'function') {
            emitEvent('polypoint:upload:complete', detail)
            return
        }

        window.dispatchEvent(
            new CustomEvent('polypoint:upload:complete', { detail }),
        )
    }

    getFilename() {
        const rawName = this.$refs.filename?.value
        let filename = (rawName ?? 'my-filename.png').trim()

        if (filename.length < 1) {
            filename = 'my-filename.png'
        }

        if (!filename.includes('.')) {
            filename = `${filename}.png`
        }

        return filename
    }

    getUploadUrl() {
        return this.$refs.upload_url?.value || '../upload/image/'
    }

    getTheatreFilename() {
        const fromRef = this.$refs.theatre_filename?.value
        if (fromRef && fromRef.length > 0) {
            return fromRef
        }

        return this.getFilename().replace(/\.[^.]+$/, '')
    }

    getCsrfToken() {
        const cookies = document.cookie ? document.cookie.split(';') : []

        for (const cookie of cookies) {
            const item = cookie.trim()
            if (item.startsWith('csrftoken=')) {
                return decodeURIComponent(item.slice('csrftoken='.length))
            }
        }

        return ''
    }

    async ensureScreenshotTools(needsCropTools = false) {
        const screenshotReady = Boolean(stage?.screenshot?.toBlob)
        const cropReady = Boolean(window?.detectEdges && stage?.screenshot?.toBlobCropped)

        if (screenshotReady && (!needsCropTools || cropReady)) {
            return
        }

        const files = ['../point_src/screenshot.js']
        if (needsCropTools) {
            files.push('../point_src/image-edge-detection.js')
        }

        await new Promise((resolve) => {
            Polypoint.head.load(files, resolve)
        })
    }

    captureFullBlob() {
        return new Promise((resolve, reject) => {
            if (!stage?.screenshot?.toBlob) {
                reject(new Error('Screenshot tooling unavailable.'))
                return
            }

            stage.screenshot.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Screenshot capture failed.'))
                    return
                }

                resolve(blob)
            })
        })
    }

    async captureThumbnailBlob() {
        if (!window?.detectEdges || !stage?.screenshot?.toBlobCropped) {
            return this.captureFullBlob()
        }

        try {
            const dimensions = stage?.dimensions
            const hasDimensions = Number.isFinite(dimensions?.width)
                && Number.isFinite(dimensions?.height)

            if (!hasDimensions) {
                return this.captureFullBlob()
            }

            const imageData = stage.ctx.getImageData(
                0,
                0,
                dimensions.width,
                dimensions.height,
            )
            const crop = detectEdges(imageData.data, imageData.width)
            const validCrop = Number.isFinite(crop?.width)
                && Number.isFinite(crop?.height)
                && crop.width > 0
                && crop.height > 0

            if (!validCrop) {
                return this.captureFullBlob()
            }

            return stage.screenshot.toBlobCropped(crop)
        } catch {
            return this.captureFullBlob()
        }
    }

    async postBlob(blob, seriesIndex = '') {
        const filename = this.getFilename()
        const imageFile = new File([blob], filename, {
            type: blob.type || 'image/png',
        })

        const formData = new FormData()
        formData.append('image_file', imageFile)
        formData.append('theatre_filename', this.getTheatreFilename())
        formData.append('series_index', seriesIndex)

        const headers = {}
        const csrfToken = this.getCsrfToken()
        if (csrfToken.length > 0) {
            headers['X-CSRFToken'] = csrfToken
        }

        const response = await fetch(this.getUploadUrl(), {
            method: 'POST',
            body: formData,
            credentials: 'same-origin',
            headers,
        })

        let data = {}
        try {
            data = await response.json()
        } catch {
            data = { error: 'Invalid JSON response.' }
        }

        if (!response.ok || data.errors) {
            const errorText = data.error
                || JSON.stringify(data.errors || {})
                || 'Upload failed.'
            throw new Error(errorText)
        }

        return data
    }

    async uploadLinkClick(event) {
        event?.preventDefault?.()
        await this.uploadImage(this.captureFullBlob.bind(this), '')
    }

    async uploadThumbnailLinkClick(event) {
        event?.preventDefault?.()
        await this.uploadImage(this.captureThumbnailBlob.bind(this), 'thumbnail')
    }

    async uploadImage(captureMethod, seriesIndex) {
        if (this.store.uploading) {
            return
        }

        this.store.uploading = true
        this.store.complete = false
        this.store.error = ''

        try {
            await this.ensureScreenshotTools(seriesIndex === 'thumbnail')
            const blob = await captureMethod()
            const data = await this.postBlob(blob, seriesIndex)
            this.store.lastFile = data.file || ''
            this.store.lastSeriesIndex = data.series_index || ''
            this.store.complete = true
            this.emitUploadComplete(data)
            console.log('Image upload complete:', data)
        } catch (error) {
            this.store.complete = false
            this.store.error = error.message || 'Upload failed.'
            console.error('Image upload failed:', error)
        } finally {
            this.store.uploading = false
        }
    }

    initData() {
        return {
            uploading: false,
            complete: false,
            error: '',
            lastFile: '',
            lastSeriesIndex: '',
        }
    }
}

const uploadApp = UploadApp.loadMount('#upload_image_app')

