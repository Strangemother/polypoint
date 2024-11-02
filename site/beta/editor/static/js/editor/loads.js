/*

;ljs
    .addAliases({
        jQuery:'http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js#jqueryId' // <- script tag will have attribute id=jqueryId
        ,ui:[
            'jQuery'
            ,'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js'
            ,'myUITheme.css'
        ]

    })
    .load('ui',function(){
        // work with both jquery and jquery-ui here
    })
;
*/

console.log('primaryLoads')
const primaryLoads = {
    editor: [
        "/static/js/editor/editor-config.js"
        , "https://cdn.jsdelivr.net/npm/ace-builds@1.36.0/src-min-noconflict/ace.js#ace"
        , "https://cdn.jsdelivr.net/npm/ace-builds@1.36.0/css/ace.min.css#ace_css"
        , "/static/js/editor/ace-editor.js"
         // "../editor/ace-editor.js#editor"
    ]
    // , head: "../point_src/core/head.js#head"
    // , fps: [
    //     "../point_src/text/alpha.js#text-alpha"
    //     , "../point_src/text/fps.js#text-fps"
    // ]
    // , capture: [
    //     "../point_src/capture/CCapture.js"
    //     , "../point_src/capture/gif.js"
    //     , "../point_src/capture/encoder.js"
    //     , "../point_src/capture/download.js"
    // ]
    // , other: [
    //     // 'head'
    //      'fps'
    //     , "../point_src/setunset.js#stroke"
    //     , "../point_src/stroke.js#stroke"
    //     , "../point_src/point-content.js#point"
    //     , "../point_src/pointlist.js#pointlist"
    //     , "../point_src/point.js#point"
    //     , "../point_src/events.js#events"
    //     , "../point_src/automouse.js#automouse"

    //     , "../point_src/bisector.js#bisector"

    //     , "../point_src/distances.js#distances"
    //     , "../point_src/dragging.js#dragging"
    //     , "../point_src/stage.js#stage"
    // ]
    // , point: [
    //     'head'
    //     , "../point_src/pointpen.js#pointpen"
    //     , "../point_src/pointdraw.js#pointdraw"
    // ]
}


;ljs.addAliases(primaryLoads)
