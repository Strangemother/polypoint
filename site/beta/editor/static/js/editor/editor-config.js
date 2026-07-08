
const polypointEditorConfig = {
    version: 0.1
    , editorConfig: {
        firstFile: '/static/js/editor/init-example.js'
        /* auto start upon an auto restore (run on load) */
        , firstRunAutoload: true
        , autoReload: true
        , autoSave: true
        , restoreLastEdited: true
    }

    , aceConfig: {
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

    }

}
