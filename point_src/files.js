/*

# Files

The polypoint library and its assets are designed to be live-loadable.

    Polypoint.load('fps')

This file list describes the dependencies for importing products.
It can be used for live-loading, or a compile step

All files are relative to _this_ file (at the root of the polypoint lib)

 */


const polypointFileAssets = function(js='') {
    return  {
        head: `${js}core/head.js#head`
        // , editor: [
        //     "../editor/editor-config.js"
        //     , "https://cdn.jsdelivr.net/npm/ace-builds@1.36.0/src-min-noconflict/ace.js#ace"
        //     , "https://cdn.jsdelivr.net/npm/ace-builds@1.36.0/css/ace.min.css#ace_css"
        //     , "../editor/ace-editor.js"
        //      // "../editor/ace-editor.js#editor"
        // ]
        , fps: [
            `${js}text/alpha.js#text-alpha`
            , `${js}text/fps.js#text-fps`
        ]
        , capture: [
            `${js}capture/CCapture.js`
            , `${js}capture/gif.js`
            , `${js}capture/encoder.js`
            , `${js}capture/download.js`
        ]
        , pointlist: [
            `${js}pointlist.js#pointlist`
        ]
        , mouse: [
            'point'
            , `${js}events.js#events`
            , `${js}automouse.js#automouse`
        ]
        , other: [
            // 'head'
             'fps'
            , `${js}stroke.js#stroke`
            , 'pointlist'
            , 'mouse'
            , `${js}bisector.js#bisector`
            , `${js}distances.js#distances`
            , `${js}dragging.js#dragging`
            , `${js}stage.js#stage`
        ]
        , point: [
            'head'
            , `${js}pointpen.js#pointpen`
            , `${js}point-content.js#point`
            , `${js}pointdraw.js#pointdraw`
            , `${js}point.js#point`
        ]
        , everything: [
            'head'
            // , 'pointlist'
            , 'point'
            , 'other'
        ]
    }
}
