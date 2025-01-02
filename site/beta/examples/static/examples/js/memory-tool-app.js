/*

Present the running memory of the view

    window.onload = function(){
        createMemoryApp(appShared)
    }

requires:
    PetiteVue

template:

    {% verbatim %}
    <div id="memory-values" class="memory-values-container">
        <div class='memory-cell' v-for='item in memoryCache'>
            <span class="label">{{ item.label }}</span>
            <span id="memory-total-value">{{ item.value }} {{ item.postfix }}</span>
        </div>
    </div>
    {% endverbatim %}
 */

const createMemoryApp = function(sharedObject=appShared.memoryCache) {
    /*
        A Petite Vue app to present the memory values to the view
    */

    // tick forever, updating the memoryCache object.
    startMemoryCacher()

    PetiteVue.createApp({
        /* Is updated periodically in the background.
        Vue cares for the changes. */
        memoryCache: sharedObject
    }).mount('#memory-values')
}

const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];


const niceBytes = function(x){
    return niceBytesPair(x).join(' ')
}


const niceBytesPair = function(x){
    let l = 0,
        n = parseInt(x, 10) || 0
        ;
  while(n >= 1024 && ++l){
      n = n/1024;
  }
  return [n.toFixed(n < 10 && l > 0 ? 1 : 0), units[l]]
}


const startMemoryTool = function() {
    const $mt = document.getElementById('memory-total-value')
    const $mu = document.getElementById('memory-used-value')
    const $ml = document.getElementById('memory-limit-value')

    const update = function() {
        let mi = performance.memory
        let nbh = niceBytesP(mi.totalJSHeapSize);
        if($mt.innerText != nbh) {
            $mt.innerText = nbh
        }
        nbh = niceBytes(mi.usedJSHeapSize)
        if($mu.innerText != nbh) {
            $mu.innerText = nbh
        }
        nbh = niceBytes(mi.jsHeapSizeLimit)
        if($ml.innerText != nbh) {
            $ml.innerText = nbh
        }
    }

    setInterval(update, 1000)
    update()
};


const startMemoryCacher = function() {
    /*
    Every 1 second store the the js memory allocation to the `memoryCache` object.
    This is reactive using the petite-vue html component.
     */

    const update = function(memoryCache=appShared.memoryCache) {
        /* Called at an interval to store the memory value to the shared
        cache object. */
        let mi = performance.memory

        const make = function(title, pair) {
            return memoryCache[title] = {
                label: title
                , value: pair[0]
                , postfix: pair[1]
            }
        }

        let sets = {
            'total': mi.totalJSHeapSize
            , 'used': mi.usedJSHeapSize
            , 'heap': mi.jsHeapSizeLimit
        }

        for(let k in sets) {
            make(k, niceBytesPair(sets[k]))
        }
    }

    setInterval(update, 1000)
    update()
};

