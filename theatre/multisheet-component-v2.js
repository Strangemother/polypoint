console.log('multisheet-component')

const plog = function(){
    let s = Array.from(arguments).join(' ')
    console.log(`%c ${s}`, 'background: #111; color: #bada55');
}


class PolypointCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.buildView(this.createStyles());
        this.setupListeners();
    }

    scriptType = 'javascript'

    static get observedAttributes() {
        return ['width', 'height'];
    }

    createStyles(){
        const dce = document.createElement.bind(document);
        const style = dce('style');
        style.textContent = `
            :host { display: block; }
            canvas { display: block; border: 1px solid #ccc; }
            div { font-family: sans-serif; }
            .code-content { white-space: pre-line; font-family: monospace; }
          `;
        this._style = style;
        return style;
    }

    setupListeners(){
        this.configSlot.addEventListener('slotchange', () => {
            this.parseSlotConfig();
            this.setupCanvas();
        });

        this.textSlot.addEventListener('slotchange', () => {
            this.parseTextSlot();
        });
    }

    buildView(style){
        const dce = document.createElement.bind(document);
        const wrapper = dce('div');
        this.canvas = dce('canvas');
        this.textDiv = dce('div');
        this.textDiv.classList.add('text-content');
        this.codeDiv = dce('div');
        this.codeDiv.classList.add('code-content');
        this.configSlot = dce('slot');
        this.configSlot.name = 'config';
        this.codeSlot = dce('slot');
        this.codeSlot.name = 'code';
        this.textSlot = dce('slot');
        this.textSlot.name = 'text';

        wrapper.append(this.canvas, this.textDiv, this.codeDiv, this.configSlot, this.codeSlot, this.textSlot);
        this.shadowRoot.append(style, wrapper);
    }

    connectedCallback() {
        requestAnimationFrame(() => {
            this.parseSlotConfig();
            const isFallback = this.parseTextAsFallbackCode();
            this.parseCodeSlot();
            this.parseTextSlot(isFallback);
            this.setupCanvas();
        });
    }

    attributeChangedCallback() {
        this.setupCanvas();
    }

    parseSlotConfig() {
        let configNode = null;
        const nodes = this.configSlot.assignedNodes({ flatten: true });
        configNode = nodes.find(n => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.ELEMENT_NODE);

        if (!configNode) {
            const script = this.querySelector('script[type="application/json"]');
            if (script) {
                configNode = script;
            } else {
                return;
            }
        }

        let json = configNode.textContent.trim();
        try {
            const config = JSON.parse(json);
            for (const [k, v] of Object.entries(config)) {
                this.setAttribute(k, v);
            }
        } catch (e) {
            console.warn('Invalid JSON in config source:', e);
        }
    }

    parseTextAsFallbackCode() {
        const hasCodeSlot = this.querySelector('[slot="code"]') !== null;
        const hasScript = this.querySelector(`script[type="${this.scriptType}"]`) !== null;

        if (!hasCodeSlot && !hasScript) {
            const fallbackCode = Array.from(this.childNodes).map(n => n.textContent).join('').trim();
            if (fallbackCode) {
                try {
                    const fn = new Function('canvas', 'context', fallbackCode);
                    this._onSetupCanvas = ({ canvas, context }) => fn(canvas, context);
                    this.codeDiv.textContent = fallbackCode;
                    return true;
                } catch (err) {
                    console.warn('Error evaluating fallback text as code:', err);
                }
            }
        }
        return false;
    }

    parseCodeSlot() {
        const codeNodes = this.codeSlot.assignedNodes({ flatten: true });
        let codeText = codeNodes.map(n => n.textContent).join('').trim();

        if (!codeText) {
            const script = Array.from(this.childNodes).find(
                node => node.nodeType === Node.ELEMENT_NODE &&
                        node.tagName === 'SCRIPT' &&
                        node.type === this.scriptType
            );
            if (script) {
                codeText = script.textContent.trim();
            }
        }

        if (codeText) {
            try {
                const fn = new Function('canvas', 'context', codeText);
                this._onSetupCanvas = ({ canvas, context }) => fn(canvas, context);
            } catch (err) {
                console.warn('Error evaluating code:', err);
            }

            if (this.codeDiv.textContent.trim() === '') {
                this.codeDiv.textContent = codeText;
            }
        }
    }

    parseTextSlot(skipText = false) {
        if (skipText) return;

        const assignedText = this.textSlot.assignedNodes({ flatten: true });
        if (assignedText.length > 0) {
            const textContent = assignedText.map(n => n.textContent).join('').trim();
            this.textDiv.textContent = textContent;
        } else {
            const hasCodeSlot = this.querySelector('[slot="code"]') !== null;
            const hasScript = this.querySelector(`script[type="${this.scriptType}"]`) !== null;
            const excludeTags = ['SCRIPT'];
            const fallback = Array.from(this.childNodes).filter(n => {
                return (
                    n.nodeType === Node.TEXT_NODE ||
                    (n.nodeType === Node.ELEMENT_NODE && !excludeTags.includes(n.tagName) &&
                     n.getAttribute('slot') !== 'config' &&
                     n.getAttribute('slot') !== 'code')
                );
            });

            const fallbackText = fallback.map(n => n.textContent).join('').trim();
            if (!hasCodeSlot && !hasScript) {
                this.textDiv.textContent = fallbackText;
            }
        }
    }

    setupCanvas() {
        const width = parseInt(this.getAttribute('width')) || 100;
        const height = parseInt(this.getAttribute('height')) || 100;
        const color = this.getAttribute('color') || undefined;

        this.canvas.width = width;
        this.canvas.height = height;

        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        if (color !== undefined) {
            ctx.fillStyle = color;
        }

        this.dispatchEvent(new CustomEvent('setup-canvas', {
            detail: { canvas: this.canvas, context: ctx },
            bubbles: true,
            composed: true
        }));

        if (typeof this._onSetupCanvas === 'function') {
            this._onSetupCanvas({ canvas: this.canvas, context: ctx });
        }
    }

    onSetupCanvas(fn) {
        if (typeof fn === 'function') {
            this._onSetupCanvas = fn;
        }
    }
}

customElements.define('polypoint-canvas', PolypointCanvas);
