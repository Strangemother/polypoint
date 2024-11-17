---
title: My Title
template_name: docs/markdown-base.html
---



# Markdown Template

This template is markdown metadata: "{{ metadata }}", the markdown object has the keys: "{{ markdown.keys }}"


The template double-renderer allows the "re-render" of a template, through a function of choice, such as markdown.

This allows the _rendering_ of a template through the chosen language, leveraging the the django templating system and its integration. For example, markdown, with django tags:

```jinja
# My Template: {{ metadata.title }}

This is markdown, rendered to HTML through the templating system.

{% verbatim %}<div>
{% for object in object_list %}
+ {{ object_list }}
{% endfor %}
</div>
```

{% endverbatim %}

---

DoubleRenderer, can allow the leverage of markdown or other languages (e.g. toml)

in its raw form we have a basic TemplateResponse. This performs a normal template render and can replace the response_class.

In the second form, the response mixin can _test_ for the template extension. if the extension is the incorrect type (such as HTML), we can omit the subrendering.

The _sub markdown response_ applys the content into a context var, allowing us to utilise a parent template, such as a markdown wrapper with site styles. Within the context we gain `markdown.html`, `markdown.text`, `markdown.metaddata` (and just `metadata`)

The template response mizin can grab assets from the parent view, and run those methods, such as `get_markdown`. This allows exposing the markdown (or other) rendering languages.

The template itself may be able to alter the template. metadata options such as `template` can adapt the parent (wrapper version) to alternative layouts.

This extends to the _metadata key values_, where some are single keys, others are iterable.
These values should be programmable within the template if required.

```python
class ImplementView(MarkdownMixin, TemplateView):
    template_name = 'my/default-template.html'

    def get_markdown(self):
        extensions=[
            'meta'
        ]
        return markdown.Markdown(extensions=extensions)
```

The template should be editable through metadata:

{% verbatim %}

    ---
    title: My Title
    template: alt/named.html
    scripts:
        {% static ... %}
        {% static ... %}
    ---
    # Markdown Template

    This template is markdown {{ metadata }}

{% endverbatim %}

This doesnt need to extend a markdown template, as such the standard inheritence method is applied!

---

Extending the template load directory to a folder outside the standard template dirs (e.g. in the `/docs/`)

---

You _could_ wrap the entire content in your standard django blocking

    {% verbatim %}
    {% extends "./doc-base.html" %}
    {% endverbatim %}

But the metadata wont render correctly.

