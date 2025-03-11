title: Stage Events
---

The stage will dispatch events as it loads.

+ `stage:load`
+ `stage:prepare`

The events dispatch a standard `CustomEvent`. Listen to them using a standard event listener:

```js
addEventListener('stage:load', (e)=>stages.add(e.detail.stage));
```

When using a `Stage`, dispatch events through the convenient function:

```js
class MainStage extends Stage {
    load(){
        this.dispatch('stage:load', {stage:this})
    }
}
```