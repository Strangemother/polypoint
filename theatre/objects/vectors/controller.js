/*
title: Vector Controller Object
*/

// Gamepad integration
/**
 * Controller mapping profiles for different gamepad types
 */
const CONTROLLER_PROFILES = {
    // Standard Xbox-style controller
    XBOX: {
        name: 'Xbox Controller',
        axes: {
            leftStickX: 0,
            leftStickY: 1,
            rightStickX: 2,
            rightStickY: 3
        },
        buttons: {
            leftTrigger: 7,
            rightTrigger: 6,
            buttonA: 0,
            buttonB: 1,
            buttonBack: 8
        },
        triggerAsButton: true  // Triggers are buttons (0-1 value)
    },

    // Radiomaster TS16S RC Transmitter
    // Typical RC transmitter stick layout:
    // - Right stick: Throttle (vertical), Rudder (horizontal)
    // - Left stick: Elevator (vertical), Aileron (horizontal)
    RADIOMASTER_TS16S: {
        name: 'Radiomaster TS16S',
        axes: {
            // Physical right stick controls leftStick state
            leftStickY: 2,       // Throttle - axis 1 (physical right stick vertical)
            leftStickX: 3,       // axis 2 (physical right stick horizontal)

            // Physical left stick controls rightStick state
            rightStickY: 1,      // axis 0 (physical left stick vertical)
            rightStickX: 0       // axis 3 (physical left stick horizontal)
        },
        buttons: {
            // RC transmitters typically map switches to buttons
            buttonA: 0,          // Switch A
            buttonB: 1,          // Switch B
            buttonBack: 3        // Menu/Back button
        },
        triggerAsAxis: true,     // Use axes for throttle control
        throttleAxis: 2,         // Throttle on axis 1
        throttleRange: [-1, 1]   // Full range from -1 to 1
    }
}

/**
 * 1. Capture first gamepad
 * 2. Support multiple controller profiles (Xbox, RC Transmitters)
 * 3. Map controller inputs to unified state
 */
class GamepadController {
    constructor(profile = 'XBOX') {
        this.connected = false
        this.gamepad = null
        this.deadzone = 0.015  // Ignore small stick movements

        // Set controller profile
        this.setProfile(profile)

        // Gamepad state dictionary (unified interface)
        this.state = {
            leftStickX: 0,      // Left stick horizontal (-1 to 1)
            leftStickY: 0,      // Left stick vertical (-1 to 1)
            rightStickX: 0,     // Right stick horizontal (-1 to 1)
            rightStickY: 0,     // Right stick vertical (-1 to 1)
            leftTrigger: 0,     // Left trigger (0 to 1)
            rightTrigger: 0,    // Right trigger (0 to 1)
            buttonA: false,
            buttonB: false,
            buttonBack: false,   // Back/Select button (button 8)
            buttonBackPressed: false  // Track button press for edge detection
        }

        this.setupGamepadListeners()
    }

    /**
     * Set the controller profile for input mapping
     * @param {string} profileName - Name of the profile ('XBOX', 'RADIOMASTER_TS16S')
     */
    setProfile(profileName) {
        if (CONTROLLER_PROFILES[profileName]) {
            this.profile = CONTROLLER_PROFILES[profileName]
            console.log(`Controller profile set to: ${this.profile.name}`)
        } else {``
            console.warn(`Unknown profile: ${profileName}, using XBOX`)
            this.profile = CONTROLLER_PROFILES.XBOX
        }
    }

    setupGamepadListeners() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad.id)
            this.gamepad = e.gamepad
            this.connected = true
        })

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected')
            this.connected = false
            this.gamepad = null
            this.resetState()
        })
    }

    applyDeadzone(value) {
        /* Apply deadzone to analog inputs to prevent drift */
        return Math.abs(value) < this.deadzone ? 0 : value
    }

    update() {
        /* Poll gamepad state and update the state dictionary */
        if (!this.connected) return

        // Get fresh gamepad state (required for polling API)
        const gamepads = navigator.getGamepads()
        this.gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]

        if (!this.gamepad) {
            this.connected = false
            return
        }

        const profile = this.profile
        const axes = profile.axes
        const buttons = profile.buttons

        // Update analog sticks based on profile mapping
        this.state.leftStickX = this.applyDeadzone(this.gamepad.axes[axes.leftStickX])
        this.state.leftStickY = this.applyDeadzone(this.gamepad.axes[axes.leftStickY])
        this.state.rightStickX = this.applyDeadzone(this.gamepad.axes[axes.rightStickX])
        this.state.rightStickY = this.applyDeadzone(this.gamepad.axes[axes.rightStickY])

        // Update triggers based on controller type
        if (profile.triggerAsButton) {
            // Xbox-style: triggers are buttons (0-1 range)
            if (this.gamepad.buttons[buttons.leftTrigger]) {
                this.state.leftTrigger = this.gamepad.buttons[buttons.leftTrigger].value
            }
            if (this.gamepad.buttons[buttons.rightTrigger]) {
                this.state.rightTrigger = this.gamepad.buttons[buttons.rightTrigger].value
            }
        } else if (profile.triggerAsAxis) {
            // RC Transmitter: throttle on axis (convert -1 to 1 range to 0 to 1)
            const throttleValue = this.gamepad.axes[profile.throttleAxis]
            // Convert from [-1, 1] to [0, 1] range for throttle
            this.state.leftTrigger = (throttleValue + 1) / 2
            this.state.rightTrigger = (throttleValue + 1) / 2
        }

        // Update face buttons
        this.state.buttonA = this.gamepad.buttons[buttons.buttonA]?.pressed || false
        this.state.buttonB = this.gamepad.buttons[buttons.buttonB]?.pressed || false

        // Update back button with edge detection
        const backPressed = this.gamepad.buttons[buttons.buttonBack]?.pressed || false

        // Edge detection: only trigger once per button press
        if (backPressed && !this.state.buttonBackPressed) {
            this.state.buttonBack = true
        } else {
            this.state.buttonBack = false
        }
        this.state.buttonBackPressed = backPressed
    }

    resetState() {
        /* Reset all state values to neutral */
        this.state.leftStickX = 0
        this.state.leftStickY = 0
        this.state.rightStickX = 0
        this.state.rightStickY = 0
        this.state.leftTrigger = 0
        this.state.rightTrigger = 0
        this.state.buttonA = false
        this.state.buttonB = false
        this.state.buttonBack = false
        this.state.buttonBackPressed = false
    }
}

