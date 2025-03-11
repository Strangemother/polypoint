
const resolveCanvas = function(target, stage) {
    /* Given a target as a string or entity, return the resolved
    html entity.

        resolveCanvas('myId')
        resolveCanvas('#querySelector canvas')
        resolveCanvas(canvas)
    */

    if(target === undefined && stage.canvas !== undefined) {
        target = stage.canvas
    }

    if(target instanceof HTMLElement) {
        return target;
    }

    let node = target
    if(typeof(target) == "string") {

        node = document.getElementById(target)
        if(node == null) {
            let nodes = document.querySelectorAll(target)
            if(nodes.length == 0) {
                // Cannot find node;
                console.warn('Cannot resolve node', target)
                return undefined
            }

            if(nodes.length > 1) {
                console.warn('One canvas per stage.', target)
                return nodes[0]
            }
        }

    }

    return node;
}
