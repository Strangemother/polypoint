/*
Upload the image or other bits, within the theatre
*/

class UploadApp extends Mountable {
    storageName = 'uploadApp'
    photographerKey = 'polypoint.photographer.active'
    photographerSlowKey = 'polypoint.photographer.slow'
    photographerReadyDelayMs = 500
    photographerPageDelayMs = 250
    photographerSlowModeDelayMs = 1000

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

    mounted() {
        this.store.photographerActive = this.isPhotographerActive()
        this.store.photographerSlow = this.isPhotographerSlow()
        if (this.store.photographerActive) {
            this.runPhotographerLoop()
        }
    }

    isPhotographerActive() {
        return localStorage.getItem(this.photographerKey) === '1'
    }

    isPhotographerSlow() {
        return localStorage.getItem(this.photographerSlowKey) === '1'
    }

    setPhotographerActive(value) {
        if (value) {
            localStorage.setItem(this.photographerKey, '1')
        } else {
            localStorage.removeItem(this.photographerKey)
        }
        this.store.photographerActive = value
    }

    setPhotographerSlow(value) {
        if (value) {
            localStorage.setItem(this.photographerSlowKey, '1')
        } else {
            localStorage.removeItem(this.photographerSlowKey)
        }
        this.store.photographerSlow = value
    }

    getPhotographerPageDelayMs() {
        if (this.store.photographerSlow) {
            return this.photographerSlowModeDelayMs
        }
        return this.photographerPageDelayMs
    }

    delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    async waitForStage(maxAttempts = 40, waitMs = 200) {
        for (let index = 0; index < maxAttempts; index += 1) {
            const stageReady = Boolean(
                stage?.canvas
                && stage?.ctx
                && stage?._prepared
                && stage?.loaded,
            )

            if (stageReady) {
                await this.delay(this.photographerReadyDelayMs)
                return
            }

            if (!this.isPhotographerActive()) {
                throw new Error('Photographer stopped.')
            }

            await this.delay(waitMs)
        }

        throw new Error('Stage not ready for screenshot.')
    }

    getPhotographerNextUrl() {
        return this.$refs.photographer_next_url?.value || '../get-next/'
    }

    getPhotographerIncompatibleUrl() {
        return this.$refs.photographer_incompatible_url?.value || '../set-incompatible/'
    }

    async getPhotographerNext() {
        const response = await fetch(this.getPhotographerNextUrl(), {
            credentials: 'same-origin',
        })

        let data = {}
        try {
            data = await response.json()
        } catch {
            data = { error: 'Invalid JSON response.' }
        }

        if (!response.ok) {
            const message = data.error || 'Unable to fetch next photographer item.'
            throw new Error(message)
        }

        return data
    }

    async markPhotographerIncompatible(reason = '') {
        const formData = new FormData()
        formData.append('theatre_filename', this.getTheatreFilename())
        if (reason && reason.length > 0) {
            formData.append('reason', reason)
        }

        const headers = {}
        const csrfToken = this.getCsrfToken()
        if (csrfToken.length > 0) {
            headers['X-CSRFToken'] = csrfToken
        }

        try {
            const response = await fetch(this.getPhotographerIncompatibleUrl(), {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers,
            })

            if (!response.ok) {
                console.warn('Unable to flag file as incompatible.')
                return false
            }

            return true
        } catch (error) {
            console.warn('Unable to flag file as incompatible.', error)
            return false
        }
    }

    async movePhotographerToNext() {
        const nextData = await this.getPhotographerNext()
        if (!this.isPhotographerActive()) {
            return false
        }

        if (nextData.done || !nextData.next_url) {
            this.setPhotographerActive(false)
            return false
        }

        if (nextData.next_url === window.location.pathname) {
            this.store.error = 'Photographer could not advance to a new page.'
            this.setPhotographerActive(false)
            return false
        }

        await this.delay(this.getPhotographerPageDelayMs())
        if (!this.isPhotographerActive()) {
            return false
        }

        window.location.assign(nextData.next_url)
        return true
    }

    async startPhotographerClick(event) {
        event?.preventDefault?.()
        this.setPhotographerActive(true)
        await this.runPhotographerLoop()
    }

    togglePhotographerSlowClick(event) {
        event?.preventDefault?.()
        this.setPhotographerSlow(!this.store.photographerSlow)
    }

    stopPhotographerClick(event) {
        event?.preventDefault?.()
        this.setPhotographerActive(false)
        this.store.photographerRunning = false
    }

    async runPhotographerLoop() {
        if (this.store.photographerRunning) {
            return
        }

        this.store.photographerRunning = true
        let shouldMarkIncompatible = true

        try {
            if (!this.isPhotographerActive()) {
                return
            }

            await this.waitForStage()

            if (!this.isPhotographerActive()) {
                return
            }

            const uploadResult = await this.uploadImage(
                this.captureThumbnailBlob.bind(this),
                'thumbnail',
            )

            if (!this.isPhotographerActive()) {
                return
            }

            if (!uploadResult) {
                await this.markPhotographerIncompatible(
                    this.store.error || 'Photographer upload failed.',
                )
                await this.movePhotographerToNext()
                return
            }

            shouldMarkIncompatible = false

            await this.movePhotographerToNext()
        } catch (error) {
            this.store.error = error.message || 'Photographer failed.'
            console.error('Photographer failed:', error)

            if (!this.isPhotographerActive() || error?.message === 'Photographer stopped.') {
                return
            }

            if (shouldMarkIncompatible) {
                await this.markPhotographerIncompatible(this.store.error)
                try {
                    await this.movePhotographerToNext()
                    return
                } catch (nextError) {
                    this.store.error = nextError.message || 'Photographer failed to continue.'
                    console.error('Photographer continuation failed:', nextError)
                }
            }

            this.setPhotographerActive(false)
        } finally {
            this.store.photographerRunning = false
        }
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
            return null
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
            return data
        } catch (error) {
            this.store.complete = false
            this.store.error = error.message || 'Upload failed.'
            console.error('Image upload failed:', error)
            return null
        } finally {
            this.store.uploading = false
        }
    }

    initData() {
        return {
            uploading: false,
            complete: false,
            photographerActive: false,
            photographerRunning: false,
            photographerSlow: false,
            error: '',
            lastFile: '',
            lastSeriesIndex: '',
        }
    }
}

const uploadApp = UploadApp.loadMount('#upload_image_app')

