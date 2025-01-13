/*
file parser view accessories.
*/

var tree;

const runTreeAuto = function(){
    tree = readAsset()
    console.log(tree.result)
    console.log(tree.ast)
    console.log(tree)
    return tree
}


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


const readAsset = function() {
    /* Review the source code within the view, and
    create a readable structure of polypoint info - */
    const tr = new TreeReader
    tr.readElement('#file-content code')
    return tr
    // return JSON.stringify(ast, null, 2)
}


const testResolveComment = function(){
    let comments = tree.comments
    let method = tree.result.classes.Point.methods.asObject

    let startIndex = 82 // comment index for this func.
    let testComments = comments.slice(startIndex, startIndex+2)

    let res =  resolveCommentsWithin(method, comments)
    console.log('Length should equal 2:', res.length)
    console.log('First item is correct:', res[0]  == testComments[0])
    console.log('Second item is correct:', res[1]  == testComments[1])
    return res;
}


const resolveCommentsWithin = function(methodDefinition, treeComments) {
    /* Resolve all comments _within_ a method, This can be the first comment,
    or all inner comments.

        resolveComment(tree.result.classes.Point.methods.asObject, tree.comments)


    Return a list of 0 or more comment nodes.
    */
    // tree.result.classes.Point.methods.asObject
    // tree.comments
    // {isStatic: false, start: 16785, end: 17053}
    let openStack = false
        , items = []
        ;
    // find a comment; comment.start >= def.start, comment.end <= def.end
    treeComments.forEach(comment=>{
        openStack = (comment.start >= methodDefinition.start
                     && comment.end <= methodDefinition.end)
        // active space
        if(openStack) {
            items.push(comment)
        }

        if(comment.end >= methodDefinition.end) {
            // close space
            openStack = false;
        }
    })

    return items;
}

const treeToJSON = function() {
    console.log(JSON.stringify(tree.result, null, 2));
}


class TreeReader {

    readElement(selector) {
        this.comments = [];
        const ast = this.parseElement(selector)
        this.ast = ast;
        let finishedNodes = this.readNodeProgram(ast)

        // split classes and [other stuff]


        let classes = {}
        let notClasses = {}

        let dmap = {
            'default': (item)=> {
                notClasses[item.name] = item
            }

            , 'ClassDeclaration': (item)=>{
                classes[item.name] = item
                // delete item.name
                delete item.type
            }
        }

        finishedNodes.forEach((e,i,a)=>{
            let stackFunc = dmap[e.type]
            if(stackFunc == undefined) {
                stackFunc = dmap['default']
            }

            stackFunc(e)
        });

        /*Cross reference super properties and methods. */
        const mapped = new Map(Object.entries(classes))
        Object.values(classes).forEach((e,i,a)=> {
            let v = mapped.get(e.superClassName)
            if(v) {
                // e.superObject = v;
                // e.superProps = v;
                e.superObjectName = e.superClassName;
            }
        })

        // Inject comments to the correct nodes
        // snip source code of each method.
        return this.result = {
            classes, notClasses
        }
    }

    readNodeProgram(ast){
        /* The first node, or _root_ of the tree. */
        return ast.body.map((n, i, a) => {
            return this.readNode(n, i, a, ast)
        });
    }

    parseElement(selector) {
        let node = document.querySelectorAll(selector)[0]
        return this.parseText(node.innerText)

        // let nodes = document.querySelectorAll(selector)
        // const map = new Map()
        nodes.forEach((n)=>{
            const v = this.parseText(n.innerText)
            // map.set(n, v)
        })
        // return map
    }

    stashComment(block, text, start, end) {

        this.comments.push({
            block, text, start, end
        })
    }

    parseText(text) {
        // https://github.com/acornjs/acorn/tree/master/acorn/#interface
        const tree = this;
        const stash = tree.stashComment.bind(tree)
        return acorn.parse(text, {
            ecmaVersion: 'latest'
            , locations: true
            , onComment: function(block, text, start, end){
                stash(block, text, start, end)
                /*
                block:  true if the comment is a block comment,
                        false if it is a line comment.
                text:   The content of the comment.
                start:  Character offset of the start of the comment.
                end:    Character offset of the end of the comment.
                 */
            }
        })
    }

    readNode(node, index, items, ast){
        let n = node.type
        let fname = `readNode${n}`
        if(this[fname] == undefined) {
            return {action: 'skipped', type: n}
        }

        return this[fname].apply(this, arguments)
    }

    readNodeClassDeclaration(node, index, items, ast) {
        /* Read a class definition,
            + Methods
            + Properties
        */
        const name = node.id.name
        const superClassName = node.superClass?.name;


        // readNodeMethodDefinition
        const classDeclaration = node.body
        const bodyItems = classDeclaration.body.map((n, i, a) => {
            return this.readNode(n, i, a, node, ast)
        })

        let methods = {}
        let properties = {}
        let dmap = {
            'property': properties
            , 'method': methods
        }
        // split methods and properties
        bodyItems.forEach((e) => {
            let { isStatic, start, end } = e;
            dmap[e.type][e.name] = { isStatic, start, end }
        })

        return {
            type: node.type
            , name
            , superClassName
            , methods, properties
        }
    }

    readNodeMethodDefinition(node, index, items, parentNode, tree) {
        /* Read a single method definition. */

        return {
            name: node.key.name
            , type: 'method'
            , isStatic: node.static
            , start: node.start
            , end: node.end
        }
    }

    readNodePropertyDefinition(node, index, items, parentNode, tree) {

        return {
            name: node.key.name
            , type: 'property'
            , isStatic: node.static
        }
    }

    getNodeMethods(classBodyNode) {
        /* return a dictionary of method definitions. the key being the
        method name.
            const methods = this.getNodeMethods(node.body)
        */
        let methods = {}
        for(let node of classBodyNode.body) {
            if(node.type != 'MethodDefinition') {
                continue
            }
            let res = this.getMethodInfo(node)
            methods[res.name] = res
        }

        return methods
    }

    getMethodInfo(node) {
        /* return the information for a method. */

        return {
            name: node.key.name
            , isStatic: node.static
            , start: node.start
            , end: node.end
        }
    }

}

;runTreeAuto();

