
const loadPolypointCoreTools = function() {

    /* fileassets function, loaded through the point_src/files.js file.*/
    polypointRootPath = '../point_src/'
    let assets = polypointFileAssets(polypointRootPath)
    ljs.addAliases(assets)


    /* Read the point_src/files.js for definitions */
    let fundamentals = [
        // 'point',
        // 'stage',
        // 'mouse',
        // 'pointlist',
        // 'dragging',
        // 'bisector',
        // 'stroke',
        "head"
        , "stroke"
        , "../point_src/point-content.js"
        , "pointlist"
        , "../point_src/relative-xy.js"
        , "../point_src/compass.js"
        , "point"
        , "../point_src/protractor.js"
        , "mouse"
        , "dragging"
        , "../point_src/functions/clamp.js"
        , "stage"
        , "../point_src/distances.js"
        , "../point_src/rotate.js"
        , "../point_src/center.js"
        , "../point_src/stage-resize.js"
        , "../point_src/functions/resolve.js"
        , "../point_src/angle.js"
        , "../point_src/text/label.js"
        , "/examples/theatre/objects/tetra.js"
        // , "head"
        // , "point"
        // , "pointlist"
        // , "mouse"
        // , "stage"
        // , "stroke"

    ]

    /* Here we automatically start with point src.*/
    ljs.load('head', ()=>{
        ljs.load(fundamentals, polypointFundamentalsLoaded);
    });
}

const polypointFundamentalsLoaded = function() {
    /* The 'fundamentals' for the view are loaded.
    This does not include any values from the view source.

    Mutate the (Now existing) polypoint library, then run the "startview"
    function on the polypoint editor.

    At this point the editor takes over and loads the code.
    */
        installPolypointsLoaders()
        console.log('Point Loaded');
        // let mainDisplay = '/examples/theatre/pseudo3D-cube-2.js';
        // let mainDisplay = '/examples/theatre/grid-flag.js';
        // let mainDisplay = '/examples/theatre/pseudo3D-sphere.js';
        let mainDisplay = '/examples/theatre/pseudo3D-tetra.js';
        // Polypoint.head.load("/examples/theatre/arc-angles.js")
        Polypoint.head.load(mainDisplay, function(){
            console.log('Demo loaded')
            sendPin()
        })


    //     ljs.load('other', function(){
    //         console.log('Stage and Other loaded.')
    //         events.emit('polypoint_load_all')
            // polypointEditor.startView()
    // })
}


const installPolypointsLoaders = function(){

    Polypoint.head.load = function(name, callback){
        /* A shortcut for loading a stub*/
        return ljs.load.apply(ljs, arguments)
    }
}

;ljs.addAliases(primaryLoads)
    .load('head', function(){
        console.log('head Loaded');
        loadPolypointCoreTools()
    })
;