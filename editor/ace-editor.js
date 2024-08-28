
/*
This IIFE loads the polypoint editor config, exposing `startView`

    polypointEditor.startView(polypointEditorConfig)

 */
;const polypointEditor = (function(){


let editor, loadedConfig

const getPolyConf = function() {
    return loadedConfig?.editorConfig || loadedConfig
}

const hasHistory = function() {
    if(getPolyConf().restoreLastEdited === false) {
        return false
    }
    return localStorage.lastEdited !== undefined
}

const getStoredValue = function() {
    if(!hasHistory()) {
        return undefined
    }

    let val = localStorage.lastEdited
    try {

        let res = JSON.parse(val)
        return res.value
    } catch(e) {
        console.warn('An error occured with restoring')
    }
}


const localStore = function(title='Untitled') {
    if(getPolyConf().autoSave === false) {
        return false
    }

    console.log('saving')
    let val = {
        value: editor.getValue()
        , title
        , datetime: +(new Date)
    }

    localStorage.lastEdited = JSON.stringify(val)
    return true
}


const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
const niceBytes = function(x){
  let l = 0, n = parseInt(x, 10) || 0;
  while(n >= 1024 && ++l){
      n = n/1024;
  }
  return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

const debounceClocks = new Map;
const debounce = function(func, time) {
    let clock = debounceClocks.get(func)
    if(clock){
        window.clearTimeout(clock)
    }
    clock = window.setTimeout(func, time)
    debounceClocks.set(func, clock)
}

// ==========================================================

const localStoreAndRun = function() {
    /*
        run the localstore function
        and execute the auto-run feature.
    */
   let conf = getPolyConf()
   localStore()//conf.autoSave
   if(conf.autoReload){
        aceRunText()
   }

}

/* Provide an object or default load the polypointEditorConfig */
const startView = function(conf=polypointEditorConfig) {
    console.log('Loading Editor');
    loadedConfig = polypointEditorConfig
    editor = createEditor(conf.aceConfig)
    startMemoryTool()
    installFirstValue(conf.editorConfig);
}


const startMemoryTool = function() {
    const $mt = document.getElementById('memory-total-value')
    const $mu = document.getElementById('memory-used-value')
    const $ml = document.getElementById('memory-limit-value')

    setInterval(function() {
        let mi = performance.memory
        let nbh = niceBytes(mi.totalJSHeapSize);
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
    }, 1000)
}


const createEditor = function(conf) {
    return ace.edit("editor", conf);
    // editor.setTheme("ace/theme/monokai");
    // editor.session.setMode("ace/mode/javascript");
}


const initExample = function(d){
    let t = d;
    if(d.value!=undefined) {
        t = d.value
    }
    editor.setValue(t, -1)
    editor.session.on('change', function(delta) {
        // delta.start, delta.end, delta.lines, delta.action
        debounce(localStoreAndRun, 1000)
    });

    firstRun(t)
    return t
}


const installFirstValue = function(editorConfig) {
    let value = getStoredValue()
    if(value != undefined && value.trim().length > 1) {
        setTimeout(function(){

            initExample(value)
        }, 5)
        return
    }
    let firstFile = editorConfig.firstFile || '../editor/init-example.js';
    fetch(firstFile)
        .then(
            (r)=>r.text()
        )
        .then(initExample)
    ;
}

let libLoaded = false;
let firstRunOnLibLoad = false;
addEventListener("polypoint_load_all", function() {
    libLoaded = true
    if(firstRunOnLibLoad) {
        console.log('Running waiting ace text')
        aceRunText()
    }
});

const firstRun = function(t) {
    console.log('Checking firstrun')
    let conf = getPolyConf()
   if(conf.firstRunAutoload) {
        console.log('Running ace text')
        if(libLoaded) {
            aceRunText()
        } else {
            console.log('Editor loaded before library')
            firstRunOnLibLoad = true
        }
   }
}


const aceRunText = function(){
    let t = editor.getValue()
    console.log('run', t.length)
    var head = {}
    let funner = Function(`
        ;(function(givenArgs){
            console.log('Checking for Stage in', this)
            console.log('Given', givenArgs);

            ${t}

            ;console.log('Assert class...')
        }).apply(this.head, arguments);
    `)

    funner.apply({head: {}, stage: undefined}, ['Apples'])
    return false;
}

    return {editor, startView, aceRunText}
})()
