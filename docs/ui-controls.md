# UI Controls

The tools need to be refactored for easier usage

---

The controls are applied late. Therefore an early handle may not be possible.

The _buttons-app_ of the theatre has the primary `addControl` and its helpers.

## Quick Example

A button is very common - so a quick helper function exists:

```js
addButton('save', {
    label: "Save JSON"
    , onclick(ev) {
        console.log('Save')
    }
})
```

Under the Hood this uses the `addControl` function:

```js
const addButton = function(name, definition)  {
    if(definition.field == undefined) {
        definition.field = 'button'
    }

    return addControl(name, definition)
}

const destroyButton = function(name)  {
    emitEvent('polypoint:control:destroy', { name })
}
```


## addControl function

The `addControl(name, definition)` emits an event to push the new control into the _buttons-app_ `controls` object

```js
addControl('save', {
    // label: "Save JSON"
    , onclick(ev) {
        console.log('Save')
    }
})
```

### Format

The options given are generally _field_ arguments for the ui component. Therefore _select_ fields have additional object prompts a _slider_ would not.

The `name` defines the _label_ id the `label` argument is missing.

```js
addControl('save', {
    label: "Save JSON"
    , onclick(ev) {
        console.log('Save')
    }
})
```

## Via Events

The `addControl` emits an event - we can do the same manually:

```js
const addExampleButton = function()  {
    let example = {
        /* An example clicky button */
        label: 'cheese'
        , onclick(ev, proxiedSelf) {
            console.log('new example Clicked', ev, proxiedSelf)
            emitEvent('example')
        }
    }

    emitEvent('polypoint:control:add', { name: 'newExample', definition: example })
}
```

## Types


A Control can be essentially any field type, as the `field` is applied to the HTML node:

```html
   <input type="{field}">
```


### Input[text]

```js
addControl('text', {
    field: 'input'
    , value: 'Bananana'
    , onchange(ev) {
        console.log('text changed')
    }
})
```

### Input[number]

Number types:

```js
addControl('number type', {
    field: 'input'
    , value: 20
    , type: 'number'
    , onchange(ev) {}
})
```

### Slider

```js
addControl('slider', {
    field: 'range'
    , stage: this
    , onchange(ev, unit) {
        /*slider changed. */
        let sval = ev.currentTarget.value
        unit.value = sval
    }
})
```

### Button

```js
addButton('button', {
    label: 'my button'
    onclick(ev) {
        console.log
    }
})
```

### Select

```js
addControl('choice', {
    field: 'select'
    , options: [
        'eggs'
        , 'butter'
        , 'bacon'
        , 'bread'
    ]
    , stage: this
    , onchange(ev) {
        let sval = ev.currentTarget.value
    }
})
```


## Helper functions