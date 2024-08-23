
const initExample = function(t){
    editor.setValue(t, -1)
    editor.session.on('change', function(delta) {
        // delta.start, delta.end, delta.lines, delta.action
        debounce(localStore, 1000)
    });
}

const installFirstValue = function() {
    if(localStorage.lastEdited != undefined) {
        setTimeout(function(){
            initExample(localStorage.lastEdited)
        }, 5)
        return
    }
    fetch('../editor/init-example.js').then((r)=>r.text().then(initExample));
}


const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

function niceBytes(x){

  let l = 0, n = parseInt(x, 10) || 0;

  while(n >= 1024 && ++l){
      n = n/1024;
  }

  return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}




const startMemoryTool = function() {
    const $mt = document.getElementById('memory-total-value')
    const $mu = document.getElementById('memory-used-value')
    const $ml = document.getElementById('memory-limit-value')

    setInterval(function() {
        let mi = performance.memory
        $mt.innerText = niceBytes(mi.totalJSHeapSize)
        $mu.innerText = niceBytes(mi.usedJSHeapSize)
        $ml.innerText = niceBytes(mi.jsHeapSizeLimit)
    }, 1000)
}

const startView = function() {
    startMemoryTool()
    installFirstValue();

}

startView()

debounceClocks = new Map

debounce = function(func, time) {
    let clock = debounceClocks.get(func)
    if(clock){
        window.clearTimeout(clock)
    }
    clock = window.setTimeout(func, time)
    debounceClocks.set(func, clock)
}



const aceRunText = function(){
    let t = editor.getValue()
    console.log('run', t)
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

const localStore = function() {
    console.log('saving')
    localStorage.lastEdited = editor.getValue()
}


const editor = ace.edit("editor", {
      mode: "ace/mode/javascript"
    , theme: "ace/theme/clouds_midnight"
    // , theme: "ace/theme/monokai"

    /*
    selectionStyle: "line"|"text"
    highlightActiveLine: true|false
    highlightSelectedWord: true|false
    readOnly: true|false
    cursorStyle: "ace"|"slim"|"smooth"|"wide"
    mergeUndoDeltas: false|true|"always"
    behavioursEnabled: boolean
    wrapBehavioursEnabled: boolean
    // this is needed if editor is inside scrollable page
    autoScrollEditorIntoView: boolean (defaults to false)
    // copy/cut the full line if selection is empty, defaults to false
    copyWithEmptySelection: boolean
    useSoftTabs: boolean (defaults to false)
    navigateWithinSoftTabs: boolean (defaults to false)
    enableMultiselect: boolean   # on by default
    enableAutoIndent: boolean
    enableKeyboardAccessibility: boolean
    */
   /*
    hScrollBarAlwaysVisible: boolean
    vScrollBarAlwaysVisible: boolean
    highlightGutterLine: boolean
    animatedScroll: boolean
    showInvisibles: boolean
    showPrintMargin: boolean
    printMarginColumn: number (defaults to 80)
    // shortcut for showPrintMargin and printMarginColumn
    printMargin: false|number
    fadeFoldWidgets: boolean
    showFoldWidgets: boolean (defaults to true)
    showLineNumbers: boolean (defaults to true)
    showGutter: boolean (defaults to true)
    displayIndentGuides: boolean (defaults to true)
    highlightIndentGuides: boolean
    fontSize: number or css font-size string
    fontFamily: css font-family value
    // resize editor based on the contents of the editor until the number of lines reaches maxLines
    maxLines: number
    minLines: number
    // number of page sizes to scroll after document end (typical values are 0, 0.5, and 1)
    scrollPastEnd: number|boolean
    fixedWidthGutter: boolean (defaults to false)
    theme: path to a theme e.g "ace/theme/textmate"
    customScrollbar: boolean
    hasCssTransforms: boolean
    maxPixelHeight: number
    useSvgGutterIcons: boolean
    */
   , fontSize: 14
   /*
    scrollSpeed: number
    dragDelay:  number
    dragEnabled: boolean (defaults to true)
    focusTimout: number
    tooltipFollowsMouse: boolean
    */
   /*
   firstLineNumber: number defaults to 1
    overwrite: boolean
    newLineMode: "auto" | "unix" | "windows"
    useWorker: boolean
    useSoftTabs: boolean
    indentedSoftWrap: boolean
    navigateWithinSoftTabs: boolean
    tabSize: number
    wrap: "off"|"free"|"printmargin"|boolean|number
    wrapMethod: 'code' | 'text' | 'auto'
    foldStyle: "markbegin"|"markbeginend"|"manual"
    mode: path to a mode e.g "ace/mode/text"
    */
    , useWorker: true
    , indentedSoftWrap: false

});
// editor.setTheme("ace/theme/monokai");
// editor.session.setMode("ace/mode/javascript");