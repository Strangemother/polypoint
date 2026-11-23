
class GamepadMonitor {
    constructor(stage, {
        onConnect, onAxis, onButton, onDisconnect
    } = {}) {
        this.stage = stage;

        for (const [name, handler] of Object.entries({
            onConnect, onAxis, onButton, onDisconnect
        })) {
            if (handler) this[name] = handler;
        }

        this.index = null;
        this.connectedGamepad = null;
        this.woken = false;
        this.axes = [];
        this.buttons = [];

        if (typeof navigator.getGamepads !== 'function') {
            console.warn('Gamepad API is unavailable');
            return;
        }
        window.addEventListener('gamepadconnected', event => {
            if (this.index === null) this.connect(event.gamepad);
        });

        window.addEventListener('gamepaddisconnected', event => {
            if (this.index !== event.gamepad.index) return;
            this.index = null;
            this.connectedGamepad = null;
            this.reset();
            this.onDisconnect({gamepad: event.gamepad});
            this.findGamepad(event.gamepad.index);
        });
        this.findGamepad();
    }

    wake(){
        // The selected gamepad is reported on wake if already connected.
        // The first update reports every input; disconnect clears the cache
        // without inventing neutral values for an unknown controller.
        let funcMap = {
            // this, stage. Callback payloads:
            // connect/disconnect: {gamepad}
            // axis: {axis, value, axes}
            // button: {button, value, pressed, touched}
            onConnect: 'onGamepadConnect',
            onAxis: 'onGamepadAxis',
            onButton: 'onGamepadButton',
            onDisconnect: 'onGamepadDisconnect',
        }
        const stage = this.stage
        for (let key in funcMap) {
            if(stage[funcMap[key]]){
                this[key] = stage[funcMap[key]].bind(stage);
            }
        }
        if (!this.woken && this.connectedGamepad && stage.onGamepadConnect) {
            this.onConnect({gamepad: this.connectedGamepad});
        }
        this.woken = true;
    }

    connect(gamepad) {
        this.index = gamepad.index;
        this.connectedGamepad = gamepad;
        this.onConnect({gamepad});
    }

    findGamepad(excludedIndex = null) {
        const gamepad = Array.from(navigator.getGamepads()).find(pad =>
            pad && pad.connected && pad.index !== excludedIndex
        );
        if (gamepad) this.connect(gamepad);
    }

    update() {
        if (this.index === null) return;
        const gamepad = navigator.getGamepads()[this.index];
        if (!gamepad) return;

        const axes = Array.from(gamepad.axes);
        axes.forEach((value, axis) => this.setAxis(axis, value, axes));
        gamepad.buttons.forEach((button, index) => {
            this.setButton(index, button);
        });
    }

    setAxis(axis, value, axes) {
        if (value === this.axes[axis]) return;
        this.axes[axis] = value;
        this.onAxis({axis, value, axes: axes.slice()});
    }

    setButton(button, {value, pressed, touched}) {
        const previous = this.buttons[button];
        if (previous && value === previous.value
                && pressed === previous.pressed
                && touched === previous.touched) return;
        this.buttons[button] = {value, pressed, touched};
        this.onButton({button, value, pressed, touched});
    }

    onAxis({axis, value}){
        console.log('axis', axis, value)
    }
    onConnect({gamepad}){
        console.log('gamepad connected', gamepad)
    }
    onDisconnect({gamepad}){
        console.log('gamepad disconnected', gamepad)
    }
    onButton({button, value, pressed, touched}){
        console.log('button', button, value, pressed, touched)
    }

    reset() {
        this.axes = [];
        this.buttons = [];
    }
}

Polypoint.head.deferredProp('Stage', function gamepad(){
    return new GamepadMonitor(this, {})
})
