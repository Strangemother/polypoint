(() => {
    const stamp = Date.now() / 1000;
    var endpoint = new URL("latest_change/", window.location.href);

    if (window?.CALL_REF) {
        console.log('OUT', window.CALL_REF.change_url)
        endpoint = new URL(window.CALL_REF.change_url, window.location.href)
        console.log('OUT', endpoint)
    }

    async function poll() {
        endpoint.searchParams.set("stamp", stamp);
        console.log('tick')
        try {
            const response = await fetch(endpoint, {
                headers: { Accept: "application/json" },
            });
            if (!response.ok) {
                throw new Error(`Latest-change request failed: ${response.status}`);
            }

            const result = await response.json();
            // Consume at most once per browser tab. The server additionally
            // expires commands and verifies that this viewer is the owner.
            const navigation = result.navigation;
            if (navigation?.id && navigation?.url) {
                const key = 'polypoint.lastNavigationCommand';
                let lastId = null;
                try { lastId = window.sessionStorage.getItem(key); } catch (_) {}
                if (navigation.id !== lastId) {
                    try { window.sessionStorage.setItem(key, navigation.id); } catch (_) {}
                    const target = new URL(navigation.url, window.location.href);
                    // Never navigate from a command outside our own origin.
                    if (target.origin === window.location.origin &&
                            target.pathname.startsWith('/llm_api/theatres/')) {
                        window.location.assign(target.href);
                        return;
                    }
                }
            }
            if (result.url && result.latest_change > stamp) {
                window.location.assign(result.url);
                return;
            }
        } catch (error) {
            console.error("Failed to poll for theatre example changes.", error);
        }

        window.setTimeout(poll, 4000);
    }

    window.setTimeout(poll, 4000);
})();
