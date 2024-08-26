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

const installPolypointsLoaders = function(){

    Polypoint.head.load = function(name, callback){
        /* A shortcut for loading a stub*/
        return ljs.load(name, function() {
            console.log('Loaded', name, arguments);
            return callback && callback()
        })
    }
}


;ljs.addAliases(primaryLoads)
    .load('editor',function(){
        console.log('editor Loaded');
        polypointEditor.startView()
    })
    .load('point', function(){
        installPolypointsLoaders()
        console.log('Point Loaded');
        ljs.load('other', function(){
            console.log('Stage and Other loaded.')
            events.emit('polypoint_load_all')
        });
    })
;