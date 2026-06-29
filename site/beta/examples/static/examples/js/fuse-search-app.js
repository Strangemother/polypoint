console.log('Fuse search app.');

const setupFuseSearch = function(){

    const dd = document.querySelectorAll('*[data-file]')

    let rr = [];

    dd.forEach(n=>{
        let name = n.dataset.file
        let a = document.querySelector('.link a')
        let desc = document.querySelector('.description').innerText
        let link = a.href
        rr.push({ name, link, desc })
    })

    const fuse = new Fuse(rr, {
      keys: ['name', 'desc']
      , includeScore: true
      , threshold: .5
    })

    return fuse;

}

window.fuse = setupFuseSearch();


const renderFuseSearch = function(search) {
    // clear if nully
    //
    if(search == undefined) {
        return clearSearch()
    }

    const results = fuse.search(search)
    console.log('results', results)
    let names = new Set(results.map((n)=> n.item.name))
    // for each node, perform class alterations.
    const nodes = document.querySelectorAll('*[data-file]')
    nodes.forEach(n=>{
        let name = n.dataset.file
        if(names.has(name)) {
            // found
            n.classList.add('filter-found')
            n.classList.remove('filter-not-found')
        } else {
            // not found
            n.classList.add('filter-not-found')
            n.classList.remove('filter-found')
        }
    })

}
