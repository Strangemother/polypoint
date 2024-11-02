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


const loadPolypointCoreTools = function() {

    /* fileassets function, loaded through the point_src/files.js file.*/
    polypointRootPath = '../point_src/'
    let assets = polypointFileAssets(polypointRootPath)
    ljs.addAliases(assets)


    /* Read the point_src/files.js for definitions */
    let fundamentals = [
        'point',// 'stage', 'mouse', 'pointlist', 'dragging', 'bisector', 'stroke',
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
    //     ljs.load('other', function(){
    //         console.log('Stage and Other loaded.')
    //         events.emit('polypoint_load_all')
            polypointEditor.startView()
    // })
}


const installPolypointsLoaders = function(){

    Polypoint.head.load = function(name, callback){
        /* A shortcut for loading a stub*/
        return ljs.load.apply(ljs, arguments)
    }
}

;ljs.addAliases(primaryLoads)
    .load('editor',function(){
        console.log('editor Loaded');
        loadPolypointCoreTools()
    })
;