class DigitizeImageApp extends Mountable {
    storageName = 'digitizeImageApp'

    mounted() {
        this.canvasStack = document.querySelector('.canvas-layer-stack')
        this.dropTarget = document.querySelector('#digitize_overlay_surface')
        this.imageNode = document.querySelector('#digitize_image')
        this.frameNode = document.querySelector('#digitize_frame')
        this.objectUrl = null
        this.dragDepth = 0
        this.baseWidth = 0
        this.baseHeight = 0
        this.interaction = null

        if (!this.dropTarget || !this.imageNode || !this.frameNode) {
            return
        }

        this.bindDropHandlers()
        this.bindTransformHandlers()
        this.applyLockState()
        this.applyTransform()
    }

    initData() {
        return {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            opacity: 0.7,
            filename: '',
            hasImage: false,
            locked: false,
        }
    }

    hasFileData(dataTransfer) {
        const types = Array.from(dataTransfer?.types || [])
        return types.includes('Files')
    }

    getImageFile(dataTransfer) {
        const files = dataTransfer?.files
        if (!files) {
            return null
        }

        for (const file of files) {
            if (file.type.startsWith('image/')) {
                return file
            }
        }
        return null
    }

    bindDropHandlers() {
        document.addEventListener('dragenter', (event) => {
            if (!this.hasFileData(event.dataTransfer)) {
                return
            }
            event.preventDefault()
            this.dragDepth += 1
            this.dropTarget.classList.add('digitize-drag-over')
        })

        document.addEventListener('dragover', (event) => {
            if (!this.hasFileData(event.dataTransfer)) {
                return
            }
            event.preventDefault()
            event.dataTransfer.dropEffect = 'copy'
        })

        document.addEventListener('dragleave', (event) => {
            if (!this.hasFileData(event.dataTransfer)) {
                return
            }
            this.dragDepth = Math.max(0, this.dragDepth - 1)
            if (this.dragDepth === 0) {
                this.dropTarget.classList.remove('digitize-drag-over')
            }
        })

        document.addEventListener('drop', (event) => {
            if (!this.hasFileData(event.dataTransfer)) {
                return
            }

            event.preventDefault()
            this.dragDepth = 0
            this.dropTarget.classList.remove('digitize-drag-over')

            const file = this.getImageFile(event.dataTransfer)
            if (!file) {
                return
            }

            this.loadImage(file)
        })

        document.addEventListener('dragend', () => {
            this.dragDepth = 0
            this.dropTarget.classList.remove('digitize-drag-over')
        })
    }

    bindTransformHandlers() {
        this.frameNode.addEventListener(
            'pointerdown',
            this.onTransformPointerDown.bind(this),
        )
        window.addEventListener(
            'pointermove',
            this.onTransformPointerMove.bind(this),
        )
        window.addEventListener('pointerup', this.endTransformPointer.bind(this))
        window.addEventListener(
            'pointercancel',
            this.endTransformPointer.bind(this),
        )
    }

    onTransformPointerDown(event) {
        if (!this.store.hasImage || this.store.locked) {
            return
        }

        const handle = event.target.closest('[data-handle]')
        let mode = 'move'
        if (handle) {
            mode = handle.dataset.handle
        } else if (event.target !== this.frameNode) {
            return
        }

        event.preventDefault()
        const center = this.getCenterPoint()
        this.interaction = {
            mode,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startX: Number(this.store.x) || 0,
            startY: Number(this.store.y) || 0,
            startScale: Number(this.store.scale) || 1,
            startRotate: Number(this.store.rotate) || 0,
            startDistance: this.getDistance(center, event.clientX, event.clientY),
            startAngle: this.getAngle(center, event.clientX, event.clientY),
        }
        this.frameNode.classList.add('digitize-transforming')
    }

    onTransformPointerMove(event) {
        if (!this.interaction) {
            return
        }

        event.preventDefault()
        const interaction = this.interaction

        if (interaction.mode === 'move') {
            const deltaX = event.clientX - interaction.startClientX
            const deltaY = event.clientY - interaction.startClientY
            this.store.x = Math.round(interaction.startX + deltaX)
            this.store.y = Math.round(interaction.startY + deltaY)
            this.applyTransform()
            return
        }

        if (interaction.mode === 'resize') {
            const center = this.getCenterPoint()
            const currentDistance = this.getDistance(
                center,
                event.clientX,
                event.clientY,
            )
            if (interaction.startDistance > 0) {
                const ratio = currentDistance / interaction.startDistance
                const newScale = this.clamp(interaction.startScale * ratio, 0.05, 5)
                this.store.scale = Number(newScale.toFixed(4))
                this.applyTransform()
            }
            return
        }

        if (interaction.mode === 'rotate') {
            const center = this.getCenterPoint()
            const currentAngle = this.getAngle(center, event.clientX, event.clientY)
            const delta = this.normalizeAngle(currentAngle - interaction.startAngle)
            this.store.rotate = Math.round(interaction.startRotate + delta)
            this.applyTransform()
        }
    }

    endTransformPointer() {
        if (!this.interaction) {
            return
        }

        this.interaction = null
        this.frameNode.classList.remove('digitize-transforming')
    }

    getCenterPoint() {
        const rect = this.dropTarget.getBoundingClientRect()
        const offsetX = Number(this.store.x) || 0
        const offsetY = Number(this.store.y) || 0
        return {
            x: rect.left + (rect.width / 2) + offsetX,
            y: rect.top + (rect.height / 2) + offsetY,
        }
    }

    getDistance(center, x, y) {
        return Math.hypot(x - center.x, y - center.y)
    }

    getAngle(center, x, y) {
        return Math.atan2(y - center.y, x - center.x) * (180 / Math.PI)
    }

    normalizeAngle(angle) {
        let value = angle
        while (value > 180) {
            value -= 360
        }
        while (value < -180) {
            value += 360
        }
        return value
    }

    clamp(value, min, max) {
        return Math.min(max, Math.max(min, value))
    }

    applyLockState() {
        if (!this.canvasStack) {
            return
        }

        this.canvasStack.classList.toggle(
            'digitize-locked',
            Boolean(this.store.locked),
        )
    }

    toggleLock() {
        this.store.locked = !this.store.locked
        this.applyLockState()
    }

    openPicker() {
        this.$refs.fileInput.click()
    }

    pickFromInput(event) {
        const file = event.target.files?.[0]
        if (!file || !file.type.startsWith('image/')) {
            return
        }
        this.loadImage(file)
        event.target.value = ''
    }

    loadImage(file) {
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl)
            this.objectUrl = null
        }

        this.objectUrl = URL.createObjectURL(file)
        this.imageNode.onload = () => {
            this.store.filename = file.name
            this.store.hasImage = true
            this.baseWidth = this.imageNode.naturalWidth || this.imageNode.width || 1
            this.baseHeight = this.imageNode.naturalHeight || this.imageNode.height || 1
            this.store.x = 0
            this.store.y = 0
            this.store.rotate = 0
            this.fitToCanvas()
            this.canvasStack?.classList.add('digitize-image-active')
            this.applyTransform()
        }
        this.imageNode.src = this.objectUrl
    }

    fitToCanvas() {
        if (!this.baseWidth || !this.baseHeight) {
            this.store.scale = 1
            return
        }

        const rect = this.dropTarget.getBoundingClientRect()
        if (!rect.width || !rect.height) {
            this.store.scale = 1
            return
        }

        const xScale = (rect.width * 0.9) / this.baseWidth
        const yScale = (rect.height * 0.9) / this.baseHeight
        const fitScale = this.clamp(Math.min(xScale, yScale, 1), 0.05, 5)
        this.store.scale = Number(fitScale.toFixed(4))
    }

    centerImage() {
        this.store.x = 0
        this.store.y = 0
        this.applyTransform()
    }

    resetTransform() {
        this.store.x = 0
        this.store.y = 0
        this.store.rotate = 0
        this.store.opacity = 0.7

        if (this.store.hasImage) {
            this.fitToCanvas()
        } else {
            this.store.scale = 1
        }

        this.applyTransform()
    }

    clearImage() {
        this.store.filename = ''
        this.store.hasImage = false
        this.store.locked = false
        this.baseWidth = 0
        this.baseHeight = 0

        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl)
            this.objectUrl = null
        }

        this.imageNode.removeAttribute('src')
        this.imageNode.style.display = 'none'
        this.frameNode.style.display = 'none'
        this.frameNode.classList.remove('digitize-transforming')
        this.canvasStack?.classList.remove('digitize-image-active')
        this.applyLockState()
    }

    applyTransform() {
        if (!this.imageNode || !this.frameNode) {
            return
        }

        if (!this.store.hasImage || !this.baseWidth || !this.baseHeight) {
            this.imageNode.style.display = 'none'
            this.frameNode.style.display = 'none'
            return
        }

        const x = Number(this.store.x) || 0
        const y = Number(this.store.y) || 0
        const scale = this.clamp(Number(this.store.scale) || 1, 0.05, 5)
        const rotate = Number(this.store.rotate) || 0
        const opacity = this.clamp(Number(this.store.opacity) || 0.7, 0.1, 1)
        const width = Math.max(20, this.baseWidth * scale)
        const height = Math.max(20, this.baseHeight * scale)
        const transform = (
            `translate(-50%, -50%) translate(${x}px, ${y}px) ` +
            `rotate(${rotate}deg)`
        )

        this.imageNode.style.display = 'block'
        this.imageNode.style.width = `${width}px`
        this.imageNode.style.height = `${height}px`
        this.imageNode.style.opacity = opacity
        this.imageNode.style.transform = transform

        this.frameNode.style.display = 'block'
        this.frameNode.style.width = `${width}px`
        this.frameNode.style.height = `${height}px`
        this.frameNode.style.transform = transform

        this.applyLockState()
    }
}

const digitizeImageApp = DigitizeImageApp.loadMount('#digitize_image_app')
