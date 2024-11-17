"""Tools to assist with theatre files.

These templatetags extend the `examples.theatre` tools.
"""

from django import template
from django.urls import resolve, reverse
from django.conf import settings

from examples import theatre

register = template.Library()

# @register.simple_tag(takes_context=True, name='file_content')
# def file_content(context, view_name, *url_args, **kwargs):
    # {% file_content "view_name" warning=message|lower profile=user.profile %}

@register.simple_tag(takes_context=True, name='theatre.render_markdown')
def render_markdown_file(context, filepath, *url_args, **kwargs):
    """Render the markdown filepath, relative to the theatre directory.

        {% theatre.render_markdown "readme.md" %}

    Creates:

        POLYPOINT_THEATRE_DIR / "readme.md"

    """
    # {% file_content "view_name" warning=message|lower profile=user.profile %}
    path = settings.POLYPOINT_THEATRE_DIR / filepath

    if path.exists() is False:
        return '' # safe exit.

    # Read the file, render, return text.
    # content = path.read_text()
    content = theatre.render_markdown(filepath, settings.POLYPOINT_THEATRE_DIR)
    return content['markdown']['html']



@register.inclusion_tag('templatetags/code_content.html', takes_context=True,
                        name='code_content')
def code_content_template(context, filename, *args, **kwargs):
    """Load the demo code file from the settings.POLYPOINT_DEMO_DIR directory.
    as a finished code block:

        <pre>
            {% code_content "events/mypoint-stage.js" %}
        </pre>
    """
    info = get_file_contents(filename)

    return {
        'lang_class': 'language-javascript',
        'exists': info['exists'],
        'content': info['content'],
        'uuid': rand_str()
    }

import string
import random


def rand_str(size=10, chars=string.ascii_lowercase + string.digits):
   return ''.join(random.choice(chars) for _ in range(size))


def get_file_contents(path, parent=None):
    parent = parent or settings.POLYPOINT_DEMO_DIR
    target = parent / path
    print('target', target)
    exists = target.exists()
    content = None
    if exists:
        content = target.read_text()
    return {
        'exists': exists,
        'content': content,
    }