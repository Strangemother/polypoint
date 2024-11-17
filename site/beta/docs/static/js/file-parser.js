/*
file parser view accessories.
*/

const parseText = function(text) {
    return acorn.parse(text, {
        ecmaVersion: 'latest'
    })
}


const parseElement = function(selector) {
    let node = document.querySelectorAll(selector)[0]
    return parseText(node.innerText)

    // let nodes = document.querySelectorAll(selector)
    // const map = new Map()
    nodes.forEach((n)=>{
        const v = parseText(n.innerText)
        // map.set(n, v)
    })
    // return map
}


const readFiles = function() {
    const ast = parseElement('#file-content')
    return ast;
    // return JSON.stringify(ast, null, 2)
}


