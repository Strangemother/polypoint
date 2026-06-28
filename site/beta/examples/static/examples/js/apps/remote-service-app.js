// remote_service_app

class RemoteServiceApp extends Mountable {
    storageName = 'remoteServiceApp'

    mounted(){
        const form = document.querySelector('#remote_service_app form')
        if (!form) {
            return
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault()
            this.submitForm(form)
        })
    }

    async submitForm(form) {
        this.store.loading = true

        try {
            const response = await fetch(form.action, {
                method: form.method || 'POST',
                body: new FormData(form),
                credentials: 'same-origin',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })

            let data = {}
            try {
                data = await response.json()
            } catch {
                data = { error: 'Invalid JSON response.' }
            }

            if (!response.ok) {
                this.store.response = data.error || 'Request failed.'
                return
            }

            this.store.response = (
                data?.choices?.[0]?.message?.content || 'No message.'
            )
        } catch (error) {
            this.store.response = error.message || 'Request failed.'
        } finally {
            this.store.loading = false
        }
    }

    initData(){
        return {
            word: 'eggs',
            response: 'nothing',
            loading: false,
        }
    }

    keepResponse() {
        console.log('Keeping response:', this.store.response)
    }
}

const remoteServiceApp = RemoteServiceApp.loadMount('#remote_service_app')

