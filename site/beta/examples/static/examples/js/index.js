;(()=>{

    const main = function(){
        let node = document.querySelector('#orderby')
        node.addEventListener('change', changeOrdering)
        setupSelectList(node)
        let aNode = document.querySelector('#direction')
        aNode.addEventListener('click', reverseClick)
    }

    const changeOrdering = function(ev){

        let searchParams = {}
        let selected = ev.target.selectedOptions[0].value
        // let is_rev = false;

        console.log("Change", selected)

        searchParams['orderby'] = selected
        // searchParams['reverse'] = is_rev

        changeURL(searchParams)
    }

    const setupSelectList = function(node){
        let v = new URL(window.location).searchParams.get('orderby')
        if(v !== null) {
            let n2;
            try {
                n2 = node.querySelector(`[value=${v}]`)
            } catch{}
            if(n2) {
                node.selectedIndex = n2.index
            }
        }
    }

    const changeURL = function(opts) {
        let l = new URL(window.location)
        for(let key in opts) {
            l.searchParams.set(key, opts[key])
        }

        window.location = l
    }

    const reverseClick = function(ev) {
        let l = new URL(window.location)
        let rev = l.searchParams.get('reverse')
        let reverse = rev? !rev.toLowerCase().startsWith('t'): false
        changeURL({ reverse })
    }

    main()
})();