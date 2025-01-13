/* An app to present the AST discoveries in the parser view using Petite Vue
*/


let treeApp = PetiteVue.createApp({

    getClasses() {
        return tree.result.classes
    }

    , get firstClass() {
        return Object.values(this.getClasses())[0]
    }

    , getComments(methodDefinition) {
        return resolveCommentsWithin(methodDefinition, tree.comments)
    }

    , getFirstCommentText(methodDefinition) {
        let comments = this.getComments(methodDefinition)
        if(comments.length == 0) {
            return '--'
        }
        return comments[0].text
    }
    , prepareForm(ev) {
        let form = document.querySelector('form')
        let $c = form.querySelector('*[name="content"]')
        let $p = form.querySelector('*[name="filename"]')
        $p.value = OBJECT_PATH
        $c.value = JSON.stringify(tree)

        form.submit()
    }
}).mount('#tree-app')

