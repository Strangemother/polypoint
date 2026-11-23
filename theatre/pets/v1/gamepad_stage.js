

class GamepadStage extends Stage {
    mounted(){
        this.gamepadSticks = {left: [0, 0], right: [0, 0]};
        this.gamepadButtons = [];
        this.gamepadMapping = null;
        this.gamepad.wake()
        this.gamepadFrame = 0;
    }

    firstDraw(ctx){
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    
    onGamepadConnect({gamepad}){
        this.gamepadMapping = gamepad.mapping;
        if (gamepad.mapping !== 'standard') {
            console.warn('Gamepad has no standard mapping; using raw input');
        } else if (gamepad.axes.length < 4
                || !gamepad.axes.slice(0, 4).every(Number.isFinite)
                || !gamepad.buttons[6] || !gamepad.buttons[7]) {
            console.warn('Gamepad is missing standard sticks or triggers');
        }
    }

    onGamepadAxis({axis, axes}){
        if (this.gamepadMapping !== 'standard' || axis > 3) {
            return
        };
        const stick = axis < 2 ? 'left' : 'right';
        const offset = stick === 'left' ? 0 : 2;
        let x = axes[offset];
        let y = axes[offset + 1];
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return
        };
        if (Math.hypot(x, y) < .015) x = y = 0;
        const previous = this.gamepadSticks[stick];
        if (x === previous[0] && y === previous[1]) {
            return
        };
        this.gamepadSticks[stick] = [x, y];
        this.onGamepadStick({stick, x, y});
    }

    onGamepadStick(input){
        // console.log('stick moved', input)
        const dirs = {
            'left': this.onLeftStick // (input);
            , 'right': this.onRightStick // (input);
        }
        return dirs[input.stick]?.call(this, input)
    }

    onGamepadTrigger(input){
        // console.log('trigger changed', input)
        const dirs = {
            'right': this.onRightTrigger
            , 'left': this.onLeftTrigger
        }
        return dirs[input.trigger]?.call(this, input)
    }

    onGamepadButton(input){
        const previous = this.gamepadButtons[input.button] || {
            value: 0, pressed: false
        };

        this.gamepadButtons[input.button] = input;
        // if (input.pressed !== previous.pressed || input.value !== previous.value) {
        //     console.log('button changed', input)
        // }

        if (this.gamepadMapping != 'standard') {
            return
        }

        const trigger = {6: 'left', 7: 'right'}[input.button];
        if (trigger) {
            if (input.value !== previous.value) {
                this.onGamepadTrigger({trigger, value: input.value});
            }
            return;
        }
        const direction = {
            12: 'up', 13: 'down', 14: 'left', 15: 'right'
        }[input.button];
        
        if (direction && input.pressed !== previous.pressed) {
            this.onGamepadDpad({direction, pressed: input.pressed});
        }
        
    }

    onGamepadDpad(input){
        console.log('d-pad changed', input)
    }

    onGamepadDisconnect(){
        if (this.gamepadMapping === 'standard') {
            for (const stick of ['left', 'right']) {
                const [x, y] = this.gamepadSticks[stick];
                if (x !== 0 || y !== 0) {
                    this.onGamepadStick({stick, x: 0, y: 0});
                }
            }
            for (const [button, trigger] of [[6, 'left'], [7, 'right']]) {
                if (this.gamepadButtons[button]?.value) {
                    this.onGamepadTrigger({trigger, value: 0});
                }
            }
            for (const [button, direction] of [
                [12, 'up'], [13, 'down'], [14, 'left'], [15, 'right']
            ]) {
                if (this.gamepadButtons[button]?.pressed) {
                    this.onGamepadDpad({direction, pressed: false});
                }
            }
        }
        this.rightTriggerValue = 0;
        this.gamepadSticks = {left: [0, 0], right: [0, 0]};
        this.gamepadButtons = [];
        this.gamepadMapping = null;
    }

    onLeftTrigger(input){}
    
}