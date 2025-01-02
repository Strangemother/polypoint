# Markdown to Markdown

A Markdown response - responding to the browser with markdown  rendered through the django templating engine

{% for item in object_list %}+ [{{ item.name }}]({{item.rel_path}})
{% endfor %}

<style type="text/css">
body {
    background: #111;
    color: #aaa;
    font-family: monospace;
    white-space: pre-wrap;
}
</style>