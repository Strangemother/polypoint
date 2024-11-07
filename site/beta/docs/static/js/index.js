const copyToClipboardContent = function(uuid) {
    let $n = document.getElementById(uuid)
    content = $n.textContent
    copyToClipboard(content)
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log(`Copied text to clipboard: ${text.length}`);
        })
        .catch((error) => {
            console.error(`Could not copy text: ${error}`);
        })
    ;
}