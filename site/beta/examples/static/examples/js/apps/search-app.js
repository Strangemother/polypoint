/*
Upload the image or other bits, within the theatre
*/

class SearchApp extends Mountable {
    storageName = 'searchApp'

    mounted() {
        this.store.searching = false
    }

    initData() {
        return {
            searching: false
        }
    }

    inputHandler(e) {
        console.log('inputHandler')
        let text = e.currentTarget.value;
        let parent = this;
        if(this.debounceTimer) {
            clearTimeout(this.debounceTimer)
        };

        this.debounceTimer = setTimeout(function() {
            if(text == '') {
                return clearFuseSearch()
            }
            renderFuseSearch(text)
        }, 500)
    }

}

const searchApp = SearchApp.loadMount('#search_app')

