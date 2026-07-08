from django import template
from django.urls import resolve, reverse
from django.conf import settings


register = template.Library()

# @register.simple_tag(takes_context=True, name='file_content')
# def file_content(context, view_name, *url_args, **kwargs):


@register.inclusion_tag('templatetags/file_content.html', takes_context=True,
                        name='file_content')
def file_content_template(context, filename, *args, **kwargs):
    """Load the given file from the demos path, and return as a content to
    push into the view.

        <pre>
            <code class='language-javascript'>
                {% file_content "events/mypoint.js" %}
            </code>
        </pre>
    """
    info = get_file_contents(filename)

    return {
        'exists': info['exists'],
        'content': info['content'],
    }


@register.inclusion_tag('templatetags/code_content.html', takes_context=True,
                        name='src_code_content')
def src_code_content_template(context, filename, *args, **kwargs):
    """Load the source code file from the settings.POLYPOINT_SRC_DIR directory.
    as a finished code block:

        <pre>
            {% src_code_content "stage.js" %}
        </pre>
    """
    info = get_file_contents(filename, settings.POLYPOINT_SRC_DIR)

    return {
        'lang_class': 'language-javascript',
        'exists': info['exists'],
        'content': info['content'],
        'uuid': rand_str()
    }


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