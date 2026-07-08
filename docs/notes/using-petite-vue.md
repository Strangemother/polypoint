# Using Petite Vue

    https://github.com/vuejs/petite-vue

This is a quick dev article to myself, discussing why I feel petite-vue could be a great tool to support a page.

+ It's small
+ it's quick
+ It has a small mental model.
+ It seems to perform 99% of what I need from a basic Vue app
+ no compilation
+ Clearer references

A primary positive of petite-vue is the no-compilation step. Although its important to note standard Vue does this too, but it's buried five clicks deep in the docs - so most people just don't realise it's an easy option. That said, with no compilation and no loadouts - getting started took seconds.

Working with Petite Vue (over Vue 2/3) takes a moment to grasp. I like Vues mounting and templating. Its method exposure and reactive data objects is the reason why I use Vue over pure javascript for for more complex applications.
Petite Vue side-steps this slightly - seemingly focusing on two general punch bags:

1. Immediate load, the _app_ is the page. All templating is applicable
2. Create micro apps, providing a _data_ object to load.

With immediate mode we import the script, applying the `init` tag. This flags the body as the entire scope.

    <script src="https://unpkg.com/petite-vue" defer init></script>

In both cases the `createApp()` handles the generation of the _app_ within the view. An object given to the function defines available parameters. From the docs:

```html
<script>
  PetiteVue.createApp({
    // exposed to all expressions
    count: 0,
    // getters
    get plusOne() {
      return this.count + 1
    },
    // methods
    increment() {
      this.count++
    }
  }).mount()
</script>

<!-- v-scope value can be omitted -->
<div v-scope>
  <p>{{ count }}</p>
  <p>{{ plusOne }}</p>
  <button @click="increment">increment</button>
</div>
```

---

Explicit mounting is a clearer direction. It's bound to direct nodes, and we can share data manually.

```js
let app = Object.assign(appShared.miniApp, {
    apples: []
    , items: PetiteVue.reactive([1,3,4,5,6,6])
});

return PetiteVue.createApp(app).mount('#mini-app')
```

Furthermore with this structure, we selectively apply the `reactive` method. This ensures other objects and references within `appShared.miniApp` are clean.

For the most part, it seems the templates act the same:


```html
{% raw %}
<div id="memory-values" class="memory-values-container">
    <div class='memory-cell' v-for='item in memoryCache'>
        <span class="label">{{ item.label }}</span>
        <span id="memory-total-value">{{ item.value }} {{ item.postfix }}</span>
    </div>
</div>
{% endraw %}
```

The supporting code for this app:

```
appShared.memoryCache = {
    total: {
        label: 'total'
        , value: 100
        , postfix: 'MiB'
    }
}
PetiteVue.createApp({
    memoryCache: appShared.memoryCache
}).mount('#memory-values')
```