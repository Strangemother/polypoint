/**
 * PolypointCanvas Web Component - Basic Implementation
 *
 * Usage:
 *   <polypoint-canvas theatre="my/theatre-file.js" width="800" height="600"></polypoint-canvas>
 *   <polypoint-canvas>context.arc(50, 50, 40, 0, 2 * Math.PI);</polypoint-canvas>
 *   <polypoint-canvas><script type="javascript">...</script></polypoint-canvas>
 */

class PolypointCanvas extends HTMLElement {
    defaultWidth = 300
    defaultHeight = 150
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['width', 'height', 'theatre'];
    }

    // Called when element is added to DOM
    connectedCallback() {
        this.mounted();
        requestAnimationFrame(() => this.loadContent());
    }

    // Called when observed attributes change
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.canvas) {
            if (name === 'theatre') {
                this.loadTheatreFile(newValue);
            } else {
                this.setupCanvas();
            }
        }
    }

    // Initializes shadow DOM with canvas and basic styles
    mounted() {
        // const style = document.createElement('style');
        // style.textContent = ':host { display: block; } canvas { display: block; }';

        this.canvas = document.createElement('canvas');
        this.setupCanvas();

        this.shadowRoot.append(this.canvas);
    }

    // Sets canvas dimensions and creates 2D context
    setupCanvas() {
        const width = parseInt(this.getAttribute('width')) || this.defaultWidth;
        const height = parseInt(this.getAttribute('height')) || this.defaultHeight;

        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
    }

    // Determines whether to load theatre file or inline script
    async loadContent() {
        const theatreFile = this.getAttribute('theatre');

        if (theatreFile) {
            this.loadTheatreFile(theatreFile);
        }
        this.loadScript();

    }

    // Loads external theatre file as script tag in document head
    loadTheatreFile(path) {
        const script = document.createElement('script');
        script.src = path + '?close_scope=1';
        script.onload = () => {
            console.log('Loaded')
            this.dispatchEvent(new CustomEvent('theatre-loaded', {
                detail: { path },
                bubbles: true
            }));
        };
        document.head.appendChild(script);
    }

    // Executes inline code or script tag content with canvas and context in scope
    loadScript() {
        const script = this.querySelector('script[type="javascript"]');
        const code = script ? script.textContent : this.textContent.trim();
        if (code) {
            const fn = new Function('canvas', 'context', code);
            fn(this.canvas, this.context);
        }
    }
}

customElements.define('polypoint-canvas', PolypointCanvas);
