(() => {
    const stamp = Date.now() / 1000;
    const endpoint = new URL("latest_change/", window.location.href);

    async function poll() {
        endpoint.searchParams.set("stamp", stamp);

        try {
            const response = await fetch(endpoint, {
                headers: { Accept: "application/json" },
            });
            if (!response.ok) {
                throw new Error(`Latest-change request failed: ${response.status}`);
            }

            const result = await response.json();
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
